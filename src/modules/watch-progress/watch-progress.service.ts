import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { offsetOf, PageResult, PaginationDto } from '../../common/pagination';
import { Episode } from '../episode/entities/episode.entity';
import { WatchProgress } from './entities/watch-progress.entity';

const visibleEpisode: FindOptionsWhere<Episode> = {
  isPublished: true,
  season: { isPublished: true, anime: { isPublished: true } },
};

function progressView(progress: WatchProgress, episode: Episode) {
  return {
    episodeId: progress.episodeId,
    episodeTitle: episode.title,
    seasonId: episode.seasonId,
    lastPositionSeconds: Math.min(progress.lastPositionSeconds, episode.durationSeconds),
    durationSeconds: episode.durationSeconds,
    isCompleted: progress.lastPositionSeconds >= episode.durationSeconds,
    updatedAt: progress.updatedAt,
  };
}

@Injectable()
export class WatchProgressService {
  constructor(
    @InjectRepository(WatchProgress) private readonly repository: Repository<WatchProgress>,
    private readonly db: DataSource,
  ) {}
  async list(userId: string, query: PaginationDto) {
    const [rows, total] = await this.repository.findAndCount({
      where: { userId, episode: visibleEpisode },
      relations: { episode: true },
      order: { updatedAt: 'DESC', episodeId: 'ASC' },
      skip: offsetOf(query),
      take: query.limit,
    });
    return new PageResult(rows.map((row) => progressView(row, row.episode)), total, query);
  }
  async get(userId: string, episodeId: string) {
    const row = await this.repository.findOne({
      where: { userId, episodeId, episode: visibleEpisode },
      relations: { episode: true },
    });
    if (!row) throw new NotFoundException('Watch progress not found');
    return progressView(row, row.episode);
  }
  save(userId: string, episodeId: string, lastPositionSeconds: number) {
    return this.db.transaction(async (manager) => {
      const episode = await manager.getRepository(Episode).createQueryBuilder('episode')
        .innerJoin('episode.season', 'season', 'season.is_published')
        .innerJoin('season.anime', 'anime', 'anime.is_published')
        .where('episode.id = :episodeId AND episode.is_published', { episodeId })
        .setLock('pessimistic_read', undefined, ['episode'])
        .getOne();
      if (!episode) throw new NotFoundException('Episode not found');
      if (lastPositionSeconds > episode.durationSeconds) {
        throw new BadRequestException('lastPositionSeconds must not exceed the episode duration');
      }
      const repo = manager.getRepository(WatchProgress);
      await repo.upsert({ userId, episodeId, lastPositionSeconds }, ['userId', 'episodeId']);
      return progressView(await repo.findOneByOrFail({ userId, episodeId }), episode);
    });
  }
  async remove(userId: string, episodeId: string) {
    await this.repository.delete({ userId, episodeId });
  }
}
