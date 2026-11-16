
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEpisodes1730000000204 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE episodes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
        episode_number smallint NOT NULL CHECK (episode_number BETWEEN 1 AND 5000),
        title varchar(160) NOT NULL,
        synopsis text NOT NULL,
        duration_seconds integer NOT NULL CHECK (duration_seconds BETWEEN 1 AND 21600),
        is_published boolean NOT NULL DEFAULT false,
        source_type varchar(10),
        approved_video_url varchar(2048),
        upload_id uuid,
        UNIQUE (season_id, episode_number),
        CONSTRAINT episodes_playback_source CHECK (
          (source_type IS NULL AND approved_video_url IS NULL AND upload_id IS NULL AND NOT is_published)
          OR (source_type IS NOT NULL AND (
            (source_type IN ('direct', 'embed') AND approved_video_url IS NOT NULL AND upload_id IS NULL)
            OR (source_type = 'upload' AND upload_id IS NOT NULL AND approved_video_url IS NULL)
          ))
        )
      );
    `);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE episodes');
  }
}
