import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessions1730000000102 implements MigrationInterface {
  async up(db: QueryRunner) {
    await db.query(`
      CREATE TABLE auth_sessions (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL
      );
      CREATE INDEX auth_sessions_user_idx ON auth_sessions(user_id);
    `);
  }

  async down(db: QueryRunner) {
    await db.query('DROP TABLE auth_sessions');
  }
}