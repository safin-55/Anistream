
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeasons1730000000203 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE seasons (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        anime_id uuid NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
        season_number smallint NOT NULL CHECK (season_number BETWEEN 1 AND 500),
        title varchar(160) NOT NULL,
        is_published boolean NOT NULL DEFAULT false,
        UNIQUE (anime_id, season_number)
      );
    `);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE seasons');
  }
}
