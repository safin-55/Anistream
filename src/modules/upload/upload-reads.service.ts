
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

import { Actor } from '../../common/access';
import { UserRole, VideoVisibility } from '../../common/domain';
import { containsText, offsetOf, PageResult } from '../../common/pagination';

import { UploadedVideo } from './entities/uploaded-video.entity';
import { ManagedUploadQueryDto, PublicUploadQueryDto } from './dto/upload-query.dto';
import { uploadView } from './upload-view';

export function canManageUpload(row: UploadedVideo, actor?: Actor) {
  return actor?.role === UserRole.ADMIN || actor?.id === row.ownerId;
}

export function assertUploadVisible(
  row: UploadedVideo | null,
  actor?: Actor,
): asserts row is UploadedVideo {
  if (!row || (row.visibility === VideoVisibility.PRIVATE && !canManageUpload(row, actor))) {
    throw new NotFoundException('Video not found');
  }
}

@Injectable()
export class UploadReadsService {
  constructor(
    @InjectRepository(UploadedVideo)
    private readonly repository: Repository<UploadedVideo>,
  ) {}

  async get(id: string, actor?: Actor) {
    const row = await this.repository.findOne({
      where: { id },
      relations: { genre: true },
    });

    assertUploadVisible(row, actor);
    return uploadView(row, canManageUpload(row, actor));
  }

  listPublic(query: PublicUploadQueryDto) {
    const where: FindOptionsWhere<UploadedVideo> = {
      visibility: VideoVisibility.PUBLIC,
    };

    if (query.genreId) {
      where.genre = { id: query.genreId, isPublished: true };
    }

    return this.list(where, query, false);
  }

  listMine(ownerId: string, query: ManagedUploadQueryDto) {
    return this.listManaged(query, ownerId);
  }

  listAdmin(query: ManagedUploadQueryDto) {
    return this.listManaged(query);
  }

  private listManaged(query: ManagedUploadQueryDto, ownerId?: string) {
    const where: FindOptionsWhere<UploadedVideo> = {};

    if (ownerId) where.ownerId = ownerId;
    if (query.visibility) where.visibility = query.visibility;
    if (query.genreId) where.genreId = query.genreId;

    return this.list(where, query, true);
  }

  private async list(
    where: FindOptionsWhere<UploadedVideo>,
    query: PublicUploadQueryDto,
    canManage: boolean,
  ) {
    if (query.q) where.title = ILike(containsText(query.q));

    const [rows, total] = await this.repository.findAndCount({
      where,
      relations: { genre: true },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: offsetOf(query),
      take: query.limit,
    });

    return new PageResult(
      rows.map((row) => uploadView(row, canManage)),
      total,
      query,
    );
  }
}
