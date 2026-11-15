import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUploads1730000000301 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE uploads (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        genre_id uuid REFERENCES genres(id) ON DELETE SET NULL,
        title varchar(160) NOT NULL,
        synopsis text NOT NULL,
        visibility varchar(10) NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
        size_bytes integer NOT NULL CHECK (size_bytes BETWEEN 1 AND 26214400),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX uploads_owner_time_idx ON uploads(owner_id, created_at DESC);
      CREATE INDEX uploads_public_time_idx ON uploads(created_at DESC) WHERE visibility = 'public';

      CREATE TABLE upload_files (
        upload_id uuid PRIMARY KEY REFERENCES uploads(id) ON DELETE CASCADE,
        content bytea NOT NULL CHECK (octet_length(content) BETWEEN 1 AND 26214400)
      );
    `);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE upload_files, uploads');
  }
}