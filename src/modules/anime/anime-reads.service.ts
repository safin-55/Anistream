
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { containsText, offsetOf, PageResult } from '../../common/pagination';
import { Anime } from './entities/anime.entity';
import { AnimeQueryDto } from './dto/anime-query.dto';

@Injectable()
export class AnimeReadsService {
  constructor(
    @InjectRepository(Anime) private readonly repository: Repository<Anime>,
  ) {}

  async list(query: AnimeQueryDto, admin = false) {
    const qb = this.baseQuery(admin);

    if (query.q) {
      qb.andWhere('anime.title ILIKE :text', {
        text: containsText(query.q),
      });
    }

    if (query.status) {
      qb.andWhere('anime.status = :status', {
        status: query.status,
      });
    }

    if (query.featured !== undefined) {
      qb.andWhere('anime.is_featured = :featured', {
        featured: query.featured,
      });
    }

    if (query.genreId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM anime_genres ag
          JOIN genres g ON g.id = ag.genre_id
          WHERE ag.anime_id = anime.id
          AND g.id = :genreId
          AND (:admin OR g.is_published)
        )`,
        { genreId: query.genreId, admin },
      );
    }

    const [rows, total] = await qb
      .orderBy('anime.createdAt', 'DESC')
      .addOrderBy('anime.id', 'DESC')
      .skip(offsetOf(query))
      .take(query.limit)
      .getManyAndCount();

    return new PageResult(rows, total, query);
  }

  async get(id: string, admin = false) {
    const row = await this.baseQuery(admin)
      .andWhere('anime.id = :id', { id })
      .getOne();

    if (!row) {
      throw new NotFoundException('Anime not found');
    }

    return row;
  }

  private baseQuery(admin: boolean) {
    const qb = this.repository.createQueryBuilder('anime');

    if (admin) {
      return qb.leftJoinAndSelect('anime.genres', 'genre');
    }

    return qb
      .leftJoinAndSelect(
        'anime.genres',
        'genre',
        'genre.is_published = true',
      )
      .where('anime.is_published = true');
  }
}
