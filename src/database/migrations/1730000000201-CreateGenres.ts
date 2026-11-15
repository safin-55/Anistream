
import { MigrationInterface, QueryRunner } from 'typeorm';
 
export class CreateGenres1730000000201 implements MigrationInterface {

  async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`

      CREATE TABLE genres (

        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

        name varchar(80) NOT NULL,

        is_published boolean NOT NULL DEFAULT false

      );

      CREATE UNIQUE INDEX genres_name_ci_key ON genres(lower(name));

    `);

  }
 
  async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query('DROP TABLE genres');

  }

}

