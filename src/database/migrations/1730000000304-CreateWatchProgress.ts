import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWatchProgress1730000000304 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE watch_progress (
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        episode_id uuid REFERENCES episodes(id) ON DELETE CASCADE,
        last_position_seconds integer NOT NULL CHECK (last_position_seconds BETWEEN 0 AND 21600),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, episode_id)
      );
      CREATE INDEX watch_progress_user_time_idx ON watch_progress(user_id, updated_at DESC);
      CREATE INDEX watch_progress_episode_idx ON watch_progress(episode_id);
    `);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE watch_progress');
  }
}
