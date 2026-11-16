import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { offsetOf, PageResult, PaginationDto } from '../../common/pagination';
import { Anime } from '../anime/entities/anime.entity';
import { WatchlistItem } from './entities/watchlist.entity';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(WatchlistItem) private readonly repository: Repository<WatchlistItem>,
    private readonly db: DataSource,
  ) {}
  async list(userId: string, query: PaginationDto) {
    const [items, total] = await this.repository.findAndCount({
      where: { userId, anime: { isPublished: true } },
      relations: { anime: true },
      order: { addedAt: 'DESC', animeId: 'ASC' },
      skip: offsetOf(query),
      take: query.limit,
    });
    return new PageResult(items.map((item) => ({
      animeId: item.animeId, addedAt: item.addedAt,
      title: item.anime.title, posterUrl: item.anime.posterUrl,
    })), total, query);
  }
  add(userId: string, animeId: string) {
    return this.db.transaction(async (manager) => {
      const anime = await manager.getRepository(Anime).findOne({
        where: { id: animeId, isPublished: true }, lock: { mode: 'pessimistic_read' },
      });
      if (!anime) throw new NotFoundException('Anime not found');
      const watchlist = manager.getRepository(WatchlistItem);
      // Keep the original added_at and lock the matching row until it has been read.
      await watchlist.createQueryBuilder().insert().values({ userId, animeId })
        .orUpdate(['anime_id'], ['user_id', 'anime_id']).execute();
      const item = await watchlist.findOneByOrFail({ userId, animeId });
      return { animeId: item.animeId, addedAt: item.addedAt };
    });
  }
  async remove(userId: string, animeId: string) {
    await this.repository.delete({ userId, animeId });
  }
}
