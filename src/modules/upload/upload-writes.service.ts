import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';

import { Actor } from '../../common/access';
import { recordAudit } from '../../common/audit';
import { UserRole, VideoVisibility } from '../../common/domain';

import { Episode } from '../episode/entities/episode.entity';
import { Genre } from '../genre/entities/genre.entity';
import { User } from '../user/entities/user.entity';

import { UploadFile } from './entities/upload-file.entity';
import { UploadedVideo } from './entities/uploaded-video.entity';

import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';

import { canManageUpload } from './upload-reads.service';
import { uploadView } from './upload-view';

@Injectable()
export class UploadWritesService {
  constructor(private readonly db: DataSource) {}

  create(actor: Actor, dto: CreateUploadDto, content: Buffer) {
    return this.db.transaction(async (manager) => {
      const owner = await manager.getRepository(User).findOne({
        where: { id: actor.id },
        lock: { mode: 'pessimistic_read' },
      });

      if (!owner || (owner.role !== UserRole.ADMIN && !owner.isVerifiedUploader)) {
        throw new ForbiddenException('Uploader approval is required');
      }

      await this.checkGenre(manager, dto.genreId);

      const uploads = manager.getRepository(UploadedVideo);

      const row = await uploads.save(
        uploads.create({
          ownerId: owner.id,
          title: dto.title,
          synopsis: dto.synopsis,
          visibility: dto.visibility ?? VideoVisibility.PRIVATE,
          genreId: dto.genreId ?? null,
          sizeBytes: content.length,
        }),
      );

      await manager.getRepository(UploadFile).insert({
        uploadId: row.id,
        content,
      });

      await recordAudit(
        manager,
        actor.id,
        'create',
        'upload',
        row.id,
        {
          visibility: row.visibility,
          rightsConfirmed: dto.rightsConfirmed,
        },
      );

      return uploadView(row, true);
    });
  }

  update(id: string, actor: Actor, dto: UpdateUploadDto) {
    return this.db.transaction(async (manager) => {
      const row = await this.lockForWrite(manager, id, actor);

      if (
        dto.visibility === VideoVisibility.PRIVATE &&
        row.visibility === VideoVisibility.PUBLIC &&
        await manager.getRepository(Episode).existsBy({ uploadId: id })
      ) {
        throw new ConflictException(
          'Unlink this upload from its episodes before making it private',
        );
      }

      await this.checkGenre(manager, dto.genreId);

      Object.assign(row, dto);

      await manager.getRepository(UploadedVideo).save(row);

      await recordAudit(
        manager,
        actor.id,
        'update',
        'upload',
        row.id,
        { visibility: row.visibility },
      );

      return uploadView(row, true);
    });
  }

  async remove(id: string, actor: Actor) {
    await this.db.transaction(async (manager) => {
      await this.lockForWrite(manager, id, actor);

      if (await manager.getRepository(Episode).existsBy({ uploadId: id })) {
        throw new ConflictException(
          'Unlink this upload from its episodes before deleting it',
        );
      }

      await manager.getRepository(UploadedVideo).delete(id);

      await recordAudit(manager, actor.id, 'delete', 'upload', id);
    });
  }

  private async checkGenre(manager: EntityManager, genreId?: string | null) {
    if (
      genreId &&
      !await manager.getRepository(Genre).existsBy({
        id: genreId,
        isPublished: true,
      })
    ) {
      throw new NotFoundException('Published genre not found');
    }
  }

  private async lockForWrite(
    manager: EntityManager,
    id: string,
    actor: Actor,
  ) {
    const row = await manager.getRepository(UploadedVideo).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!row || !canManageUpload(row, actor)) {
      throw new NotFoundException('Video not found');
    }

    return row;
  }
}
