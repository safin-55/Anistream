import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { recordAudit } from '../../common/audit';
import { PlaybackType } from '../../common/domain';
import { Episode } from './entities/episode.entity';
import { Season } from '../season/entities/season.entity';
import { hasPublicUpload } from './public-upload';
import { ApprovedMediaService } from './approved-media.service';
import { CreateEpisodeDto, PlaybackSourceDto, UpdateEpisodeDto } from './dto/episode.dto';

@Injectable()
export class EpisodeWritesService {
  constructor(private readonly db: DataSource, private readonly approvedMedia: ApprovedMediaService) {}

  create(dto: CreateEpisodeDto, actorId: string) {
    return this.db.transaction(async (manager) => {
      const { playback, ...fields } = dto;
      if (!await manager.getRepository(Season).existsBy({ id: fields.seasonId })) {
        throw new NotFoundException('Season not found');
      }
      const episodes = manager.getRepository(Episode);
      const episode = episodes.create({ ...fields, ...await this.source(manager, playback) });
      this.validatePublication(episode);
      await episodes.save(episode);
      await recordAudit(manager, actorId, 'create', 'episode', episode.id, this.auditDetail(episode));
      return episode;
    });
  }

  update(id: string, dto: UpdateEpisodeDto, actorId: string) {
    return this.db.transaction(async (manager) => {
      const episode = await this.lockEpisode(manager, id);
      const { playback, ...fields } = dto;
      Object.assign(episode, fields);
      if (playback !== undefined) Object.assign(episode, await this.source(manager, playback));
      this.validatePublication(episode);
      await manager.getRepository(Episode).save(episode);
      await recordAudit(manager, actorId, 'update', 'episode', id, this.auditDetail(episode));
      return episode;
    });
  }

  async remove(id: string, actorId: string) {
    await this.db.transaction(async (manager) => {
      await this.lockEpisode(manager, id);
      await manager.getRepository(Episode).delete(id);
      await recordAudit(manager, actorId, 'delete', 'episode', id);
    });
  }

  private async source(manager: EntityManager, playback?: PlaybackSourceDto | null) {
    if (!playback) return { sourceType: null, approvedVideoUrl: null, uploadId: null };

    if (playback.type === PlaybackType.UPLOAD) {
      if (!playback.uploadId || playback.url != null) {
        throw new BadRequestException('Upload playback requires playback.uploadId');
      }
      if (!await hasPublicUpload(manager, playback.uploadId, true)) {
        throw new NotFoundException('Public upload not found');
      }
      return { sourceType: playback.type, approvedVideoUrl: null, uploadId: playback.uploadId };
    }

    const url = playback.url && this.approvedMedia.approvedUrl(playback.url);
    if (!url || playback.uploadId != null) {
      throw new BadRequestException('External playback requires playback.url on an approved HTTPS host');
    }

    return { sourceType: playback.type, approvedVideoUrl: url, uploadId: null };
  }

  private validatePublication(episode: Episode) {
    if (episode.isPublished && !episode.sourceType) {
      throw new BadRequestException('A published episode requires a playback source');
    }
    if (episode.isPublished && episode.approvedVideoUrl &&
      !this.approvedMedia.approvedUrl(episode.approvedVideoUrl)) {
      throw new BadRequestException('A published episode requires an approved HTTPS source');
    }
  }

  private auditDetail(episode: Episode) {
    return { isPublished: episode.isPublished, sourceType: episode.sourceType, uploadId: episode.uploadId };
  }

  private async lockEpisode(manager: EntityManager, id: string) {
    const episode = await manager.getRepository(Episode).findOne({
      where: { id }, lock: { mode: 'pessimistic_write' },
    });
    if (!episode) throw new NotFoundException('Episode not found');
    return episode;
  }
}