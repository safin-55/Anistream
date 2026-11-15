import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, EntityManager, Repository } from 'typeorm';

import { recordAudit } from '../../common/audit';

import { offsetOf, PageResult, PaginationDto } from '../../common/pagination';

import { CreateGenreDto, UpdateGenreDto } from './dto/genre.dto';

import { Genre } from './entities/genre.entity';
 
@Injectable()

export class GenreService {

  constructor(

    @InjectRepository(Genre) private readonly repository: Repository<Genre>,

    private readonly db: DataSource,

  ) {}
 
  async list(query: PaginationDto, admin = false) {

    const [rows, total] = await this.repository.findAndCount({

      where: admin ? {} : { isPublished: true },

      order: { name: 'ASC', id: 'ASC' },

      skip: offsetOf(query),

      take: query.limit,

    });
 
    return new PageResult(rows, total, query);

  }
 
  async get(id: string, admin = false) {

    const genre = await this.repository.findOneBy(

      admin ? { id } : { id, isPublished: true },

    );
 
    if (!genre) throw new NotFoundException('Genre not found');

    return genre;

  }
 
  create(dto: CreateGenreDto, actorId: string) {

    return this.db.transaction(async (manager) => {

      const genres = manager.getRepository(Genre);

      const genre = await genres.save(genres.create({

        name: dto.name,

        isPublished: dto.isPublished ?? false,

      }));
 
      await recordAudit(manager, actorId, 'create', 'genre', genre.id, {

        isPublished: genre.isPublished,

      });
 
      return genre;

    });

  }
 
  update(id: string, dto: UpdateGenreDto, actorId: string) {

    return this.db.transaction(async (manager) => {

      const genre = await this.lockGenre(manager, id);
 
      if (dto.name !== undefined) genre.name = dto.name;

      if (dto.isPublished !== undefined) genre.isPublished = dto.isPublished;
 
      await manager.getRepository(Genre).save(genre);

      await recordAudit(manager, actorId, 'update', 'genre', id, {

        isPublished: genre.isPublished,

      });
 
      return genre;

    });

  }
 
  async remove(id: string, actorId: string) {

    await this.db.transaction(async (manager) => {

      await this.lockGenre(manager, id);

      await manager.getRepository(Genre).delete(id);

      await recordAudit(manager, actorId, 'delete', 'genre', id);

    });

  }
 
  private async lockGenre(manager: EntityManager, id: string) {

    const genre = await manager.getRepository(Genre).findOne({

      where: { id },

      lock: { mode: 'pessimistic_write' },

    });
 
    if (!genre) throw new NotFoundException('Genre not found');

    return genre;

  }

}
 