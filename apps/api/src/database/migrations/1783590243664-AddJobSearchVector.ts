import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobSearchVector1783590243664 implements MigrationInterface {
  name = 'AddJobSearchVector1783590243664';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD "view_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD "featured_until" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS jobs_search_vector_idx ON jobs USING GIN(search_vector)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS jobs_search_vector_idx`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "search_vector"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "featured_until"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "view_count"`);
  }
}
