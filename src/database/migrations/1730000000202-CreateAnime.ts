
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnime1730000000202 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE anime (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        slug varchar(140) NOT NULL UNIQUE,
        title varchar(160) NOT NULL,
        synopsis text NOT NULL,
        release_year smallint NOT NULL CHECK (release_year BETWEEN 1900 AND 2100),
        status varchar(12) NOT NULL CHECK (status IN ('announced', 'airing', 'completed')),
        age_rating varchar(20),
        poster_url varchar(2048),
        is_featured boolean NOT NULL DEFAULT false,
        is_published boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX anime_published_recent_idx
      ON anime(created_at DESC) WHERE is_published;

      CREATE TABLE anime_genres (
        anime_id uuid REFERENCES anime(id) ON DELETE CASCADE,
        genre_id uuid REFERENCES genres(id) ON DELETE CASCADE,
        PRIMARY KEY (anime_id, genre_id)
      );

      CREATE INDEX anime_genres_genre_idx
      ON anime_genres(genre_id);
    `);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE anime_genres, anime');
  }
}
