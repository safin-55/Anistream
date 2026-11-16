import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Actor } from '../../common/access';
import { UploadedVideo } from './entities/uploaded-video.entity';
import { selectByteRange } from './byte-range';
import { assertUploadVisible } from './upload-reads.service';

@Injectable()
export class UploadStreamService {
  constructor(private readonly db: DataSource) {}
  getBytes(id: string, actor: Actor | undefined, header: string | undefined) {
    return this.db.transaction(async (manager) => {
      const row = await manager.getRepository(UploadedVideo).findOne({
        where: { id }, lock: { mode: 'pessimistic_read' },
      });
      assertUploadVisible(row, actor);
      const range = selectByteRange(header, row.sizeBytes);
      if (!range) return { size: row.sizeBytes, range: null as null };
      const [file] = await manager.query<{ content: Buffer }[]>(
        'SELECT substring(content FROM $2::int FOR $3::int) AS content FROM upload_files WHERE upload_id = $1',
        [id, range.start + 1, range.end - range.start + 1],
      );
      if (!file) throw new NotFoundException('Video file is unavailable');
      return { size: row.sizeBytes, range, content: file.content };
    });
  }
}
