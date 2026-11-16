
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { recordAudit } from '../../common/audit';
import { offsetOf, PageResult, PaginationDto } from '../../common/pagination';
import { Anime } from '../anime/entities/anime.entity';
import { Season } from './entities/season.entity';
import {
  CreateSeasonDto,
  SeasonQueryDto,
  UpdateSeasonDto,
} from './dto/season.dto';

@Injectable()
export class SeasonService {
  constructor(
    @InjectRepository(Season)
    private readonly repository: Repository<Season>,
    private readonly db: DataSource,
  ) {}

  async listPublic(animeId: string, query: PaginationDto) {
    if (
      !await this.db.getRepository(Anime).existsBy({
        id: animeId,
        isPublished: true,
      })
    ) {
      throw new NotFoundException('Anime not found');
    }

    return this.list(
      { animeId, isPublished: true, anime: { isPublished: true } },
      query,
    );
  }

  listAdmin(query: SeasonQueryDto) {
    return this.list(
      query.animeId ? { animeId: query.animeId } : {},
      query,
    );
  }

  async get(id: string, admin = false) {
    const where = admin
      ? { id }
      : { id, isPublished: true, anime: { isPublished: true } };

    const season = await this.repository.findOneBy(where);

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    return season;
  }

  create(dto: CreateSeasonDto, actorId: string) {
    return this.db.transaction(async (manager) => {
      if (!await manager.getRepository(Anime).existsBy({ id: dto.animeId })) {
        throw new NotFoundException('Anime not found');
      }

      const seasons = manager.getRepository(Season);
      const row = await seasons.save(seasons.create(dto));

      await recordAudit(
        manager,
        actorId,
        'create',
        'season',
        row.id,
        { isPublished: row.isPublished },
      );

      return row;
    });
  }

  update(id: string, dto: UpdateSeasonDto, actorId: string) {
    return this.db.transaction(async (manager) => {
      const row = await this.lockSeason(manager, id);

      Object.assign(row, dto);

      await manager.getRepository(Season).save(row);

      await recordAudit(
        manager,
        actorId,
        'update',
        'season',
        id,
        { isPublished: row.isPublished },
      );

      return row;
    });
  }

  async remove(id: string, actorId: string) {
    await this.db.transaction(async (manager) => {
      await this.lockSeason(manager, id);

      await manager.getRepository(Season).delete(id);

      await recordAudit(manager, actorId, 'delete', 'season', id);
    });
  }

  private async list(
    where: FindOptionsWhere<Season>,
    query: PaginationDto,
  ) {
    const [rows, total] = await this.repository.findAndCount({
      where,
      order: { animeId: 'ASC', seasonNumber: 'ASC' },
      skip: offsetOf(query),
      take: query.limit,
    });

    return new PageResult(rows, total, query);
  }

  private async lockSeason(manager: EntityManager, id: string) {
    const row = await manager.getRepository(Season).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!row) {
      throw new NotFoundException('Season not found');
    }

    return row;
  }
}
