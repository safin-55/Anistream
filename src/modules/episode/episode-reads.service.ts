import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { offsetOf, PageResult, PaginationDto } from '../../common/pagination';
import { Episode } from './entities/episode.entity';
import { Season } from '../season/entities/season.entity';
import { EpisodeQueryDto } from './dto/episode.dto';

export const publishedEpisode: FindOptionsWhere<Episode> = {
  isPublished: true,
  season: { isPublished: true, anime: { isPublished: true } },
};

export function episodeView(episode: Episode) {
  const { id, seasonId, episodeNumber, title, synopsis, durationSeconds, isPublished } = episode;
  return { id, seasonId, episodeNumber, title, synopsis, durationSeconds, isPublished };
}

@Injectable()
export class EpisodeReadsService {
  constructor(
    @InjectRepository(Episode) private readonly repository: Repository<Episode>,
    private readonly db: DataSource,
  ) {}

  async listPublic(seasonId: string, query: PaginationDto) {
    const visible = await this.db.getRepository(Season)
      .existsBy({ id: seasonId, isPublished: true, anime: { isPublished: true } });
    if (!visible) throw new NotFoundException('Season not found');
    const [rows, total] = await this.findPage({ ...publishedEpisode, seasonId }, query);
    return new PageResult(rows.map(episodeView), total, query);
  }

  async listAdmin(query: EpisodeQueryDto) {
    const [rows, total] = await this.findPage(query.seasonId ? { seasonId: query.seasonId } : {}, query);
    return new PageResult(rows, total, query);
  }

  async get(id: string, admin = false) {
    const episode = await this.repository.findOneBy(admin ? { id } : { ...publishedEpisode, id });
    if (!episode) throw new NotFoundException('Episode not found');
    return episode;
  }

  private findPage(where: FindOptionsWhere<Episode>, query: PaginationDto) {
    return this.repository.findAndCount({
      where, order: { seasonId: 'ASC', episodeNumber: 'ASC' }, skip: offsetOf(query), take: query.limit,
    });
  }
}