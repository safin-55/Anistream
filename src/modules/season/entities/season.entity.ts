
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Anime } from '../../anime/entities/anime.entity';

@Entity('seasons')
@Unique(['animeId', 'seasonNumber'])
export class Season {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'anime_id', type: 'uuid' })
  animeId!: string;

  @ManyToOne(() => Anime, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'anime_id' })
  anime!: Anime;

  @Column({ name: 'season_number', type: 'smallint' })
  seasonNumber!: number;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;
}
