import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1730000000101 implements MigrationInterface {
  async up(db: QueryRunner) {
    await db.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        username varchar(32) NOT NULL UNIQUE,
        email varchar(254) NOT NULL UNIQUE,
        password_hash varchar(60) NOT NULL,
        role varchar(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        is_verified_uploader boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  async down(db: QueryRunner) {
    await db.query('DROP TABLE users');
  }
}
