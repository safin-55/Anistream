import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWatchlist1730000000303 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE watchlist (
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        anime_id uuid REFERENCES anime(id) ON DELETE CASCADE,
        added_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, anime_id)
      );
      CREATE INDEX watchlist_anime_idx ON watchlist(anime_id);
    `);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE watchlist');
  }
}
