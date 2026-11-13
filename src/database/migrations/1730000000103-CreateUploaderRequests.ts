import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUploaderRequests1730000000103 implements MigrationInterface {
  async up(db: QueryRunner) {
    await db.query(`
      CREATE TABLE uploader_requests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason varchar(500) NOT NULL,
        status varchar(10) NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'approved', 'rejected')),
        reviewed_by uuid REFERENCES users(id) ON DELETE RESTRICT,
        review_note varchar(500),
        reviewed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX uploader_requests_user_idx ON uploader_requests(user_id);

      CREATE UNIQUE INDEX uploader_requests_one_pending
        ON uploader_requests(user_id) WHERE status = 'pending';
    `);
  }

  async down(db: QueryRunner) {
    await db.query('DROP TABLE uploader_requests');
  }
}