
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AnimeStatus } from '../../../common/domain';
import { Genre } from '../../genre/entities/genre.entity';

@Entity('anime')
export class Anime {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 140, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'text' })
  synopsis!: string;

  @Column({ name: 'release_year', type: 'smallint' })
  releaseYear!: number;

  @Column({ type: 'varchar', length: 12 })
  status!: AnimeStatus;

  @Column({ name: 'age_rating', type: 'varchar', length: 20, nullable: true })
  ageRating!: string | null;

  @Column({ name: 'poster_url', type: 'varchar', length: 2048, nullable: true })
  posterUrl!: string | null;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToMany(() => Genre)
  @JoinTable({
    name: 'anime_genres',
    joinColumn: { name: 'anime_id' },
    inverseJoinColumn: { name: 'genre_id' },
  })
  genres!: Genre[];
}
