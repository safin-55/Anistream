
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, LessThan, MoreThan } from 'typeorm';
import { PlaybackType } from '../../common/domain';
import { Episode } from './entities/episode.entity';
import { hasPublicUpload } from './public-upload';
import { ApprovedMediaService } from './approved-media.service';
import { EpisodeReadsService, publishedEpisode } from './episode-reads.service';

@Injectable()
export class PlaybackService {
  constructor(
    private readonly db: DataSource,
    private readonly episodes: EpisodeReadsService,
    private readonly approvedMedia: ApprovedMediaService,
  ) {}

  async get(id: string) {
    const episode = await this.episodes.get(id);
    const url = await this.url(episode);

    if (!url) {
      throw new NotFoundException('Playback source is unavailable');
    }

    const repo = this.db.getRepository(Episode);
    const siblings = { ...publishedEpisode, seasonId: episode.seasonId };

    const [previous, next] = await Promise.all([
      repo.findOne({
        where: {
          ...siblings,
          episodeNumber: LessThan(episode.episodeNumber),
        },
        select: { id: true, episodeNumber: true },
        order: { episodeNumber: 'DESC' },
      }),
      repo.findOne({
        where: {
          ...siblings,
          episodeNumber: MoreThan(episode.episodeNumber),
        },
        select: { id: true, episodeNumber: true },
        order: { episodeNumber: 'ASC' },
      }),
    ]);

    return {
      episodeId: id,
      type: episode.sourceType,
      url,
      previousEpisodeId: previous?.id ?? null,
      nextEpisodeId: next?.id ?? null,
    };
  }

  private async url(episode: Episode) {
    if (episode.sourceType === PlaybackType.UPLOAD && episode.uploadId) {
      const publicUpload = await hasPublicUpload(
        this.db.manager,
        episode.uploadId,
      );

      return publicUpload
        ? `/api/v1/uploads/${episode.uploadId}/stream`
        : undefined;
    }

    return episode.approvedVideoUrl
      ? this.approvedMedia.approvedUrl(episode.approvedVideoUrl)
      : undefined;
  }
}
