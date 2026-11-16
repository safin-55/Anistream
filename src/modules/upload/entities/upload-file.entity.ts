import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { UploadedVideo } from './uploaded-video.entity';

@Entity('upload_files')
export class UploadFile {
  @PrimaryColumn({ name: 'upload_id', type: 'uuid' })
  uploadId!: string;

  @OneToOne(() => UploadedVideo, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'upload_id' })
  upload!: UploadedVideo;

  @Column({ type: 'bytea', select: false })
  content!: Buffer;
}