
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { PlaybackType } from '../../../common/domain';
import { Season } from '../../season/entities/season.entity';

@Entity('episodes')
@Unique(['seasonId', 'episodeNumber'])
export class Episode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'season_id', type: 'uuid' })
  seasonId!: string;

  @ManyToOne(() => Season, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season!: Season;

  @Column({ name: 'episode_number', type: 'smallint' })
  episodeNumber!: number;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'text' })
  synopsis!: string;

  @Column({ name: 'duration_seconds', type: 'integer' })
  durationSeconds!: number;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;

  @Column({ name: 'source_type', type: 'varchar', length: 10, nullable: true })
  sourceType!: PlaybackType | null;

  @Column({ name: 'approved_video_url', type: 'varchar', length: 2048, nullable: true })
  approvedVideoUrl!: string | null;

  @Column({ name: 'upload_id', type: 'uuid', nullable: true })
  uploadId!: string | null;
}
