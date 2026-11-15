import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1730000000104 implements MigrationInterface {
  async up(db: QueryRunner) {
    await db.query(`
      CREATE TABLE audit_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
        action varchar(24) NOT NULL,
        entity varchar(32) NOT NULL,
        entity_id uuid NOT NULL,
        detail jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  async down(db: QueryRunner) {
    await db.query('DROP TABLE audit_logs');
  }
}
