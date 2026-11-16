import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Episode } from '../../episode/entities/episode.entity';
import { User } from '../../user/entities/user.entity';

@Entity('watch_progress')
export class WatchProgress {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;
  @PrimaryColumn({ name: 'episode_id', type: 'uuid' })
  episodeId!: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;
  @ManyToOne(() => Episode, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'episode_id' })
  episode!: Episode;
  @Column({ name: 'last_position_seconds', type: 'integer' })
  lastPositionSeconds!: number;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
