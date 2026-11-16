import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';
import { User } from '../../user/entities/user.entity';

@Entity('watchlist')
export class WatchlistItem {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;
  @PrimaryColumn({ name: 'anime_id', type: 'uuid' })
  animeId!: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;
  @ManyToOne(() => Anime, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'anime_id' })
  anime!: Anime;
  @CreateDateColumn({ name: 'added_at', type: 'timestamptz' })
  addedAt!: Date;
}
