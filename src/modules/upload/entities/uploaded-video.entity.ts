
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VideoVisibility } from '../../../common/domain';
import { Genre } from '../../genre/entities/genre.entity';
import { User } from '../../user/entities/user.entity';

@Entity('uploads')
export class UploadedVideo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({ name: 'genre_id', type: 'uuid', nullable: true })
  genreId!: string | null;

  @ManyToOne(() => Genre, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'genre_id' })
  genre!: Genre | null;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'text' })
  synopsis!: string;

  @Column({ type: 'varchar', length: 10, default: VideoVisibility.PRIVATE })
  visibility!: VideoVisibility;

  @Column({ name: 'size_bytes', type: 'integer' })
  sizeBytes!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
