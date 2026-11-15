
import { VideoVisibility } from '../../common/domain';
import { UploadedVideo } from './entities/uploaded-video.entity';

export function uploadView(row: UploadedVideo, canManage: boolean) {
  const streamPath = `/api/v1/uploads/${row.id}/stream`;

  return {
    id: row.id,
    title: row.title,
    synopsis: row.synopsis,
    visibility: row.visibility,
    genreId: canManage || row.genre?.isPublished ? row.genreId : null,
    sizeBytes: row.sizeBytes,
    streamPath,
    sharePath: row.visibility === VideoVisibility.PUBLIC ? streamPath : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(canManage ? { ownerId: row.ownerId } : {}),
  };
}
