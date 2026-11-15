
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { recordAudit } from '../../common/audit';
import { httpsUrl } from '../../common/inputs';
import { Anime } from './entities/anime.entity';
import { Genre } from '../genre/entities/genre.entity';
import { CreateAnimeDto, UpdateAnimeDto } from './dto/anime.dto';

@Injectable()
export class AnimeWritesService {
  constructor(private readonly db: DataSource) {}

  create(dto: CreateAnimeDto, actorId: string) {
    return this.db.transaction(async (manager) => {
      const { genreIds = [], posterUrl, ...fields } = dto;
      const anime = manager.getRepository(Anime);

      const row = await anime.save(
        anime.create({
          ...fields,
          posterUrl: this.poster(posterUrl),
        }),
      );

      // Foreign keys are checked here, after insertion of the anime row.
      await this.replaceGenres(manager, row.id, genreIds);

      await recordAudit(
        manager,
        actorId,
        'create',
        'anime',
        row.id,
        { isPublished: row.isPublished },
      );

      return anime.findOneOrFail({
        where: { id: row.id },
        relations: { genres: true },
      });
    });
  }

  update(id: string, dto: UpdateAnimeDto, actorId: string) {
    return this.db.transaction(async (manager) => {
      const row = await this.lockAnime(manager, id);
      const { genreIds, posterUrl, ...fields } = dto;

      Object.assign(row, fields);

      if (posterUrl !== undefined) {
        row.posterUrl = this.poster(posterUrl);
      }

      const anime = manager.getRepository(Anime);
      await anime.save(row);

      if (genreIds !== undefined) {
        await this.replaceGenres(manager, id, genreIds);
      }

      await recordAudit(
        manager,
        actorId,
        'update',
        'anime',
        id,
        { isPublished: row.isPublished },
      );

      return anime.findOneOrFail({
        where: { id },
        relations: { genres: true },
      });
    });
  }

  async remove(id: string, actorId: string) {
    await this.db.transaction(async (manager) => {
      await this.lockAnime(manager, id);
      await manager.getRepository(Anime).delete(id);
      await recordAudit(manager, actorId, 'delete', 'anime', id);
    });
  }

  private poster(value?: string | null) {
    if (value == null) return null;

    const url = httpsUrl(value);

    if (!url) {
      throw new BadRequestException(
        'posterUrl must be an HTTPS URL without credentials or a custom port',
      );
    }

    return url.href;
  }

  private async replaceGenres(
    manager: EntityManager,
    animeId: string,
    next: string[],
  ) {
    const relation = manager
      .createQueryBuilder()
      .relation(Anime, 'genres')
      .of(animeId);

    const existing = (await relation.loadMany<Genre>()).map(
      (genre) => genre.id,
    );

    const add = next
      .map((id) => id.toLowerCase())
      .filter((id) => !existing.includes(id));

    const remove = existing.filter(
      (id) => !next.some((nextId) => nextId.toLowerCase() === id),
    );

    if (add.length || remove.length) {
      await relation.addAndRemove(add, remove);
    }
  }

  private async lockAnime(manager: EntityManager, id: string) {
    const row = await manager.getRepository(Anime).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!row) {
      throw new NotFoundException('Anime not found');
    }

    return row;
  }
}
