import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkEpisodesToUploads1730000000302 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE episodes ADD CONSTRAINT episodes_upload_fk
        FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE RESTRICT;
      CREATE INDEX episodes_upload_idx ON episodes(upload_id) WHERE upload_id IS NOT NULL;
    `);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP INDEX episodes_upload_idx; ALTER TABLE episodes DROP CONSTRAINT episodes_upload_fk');
  }
}
