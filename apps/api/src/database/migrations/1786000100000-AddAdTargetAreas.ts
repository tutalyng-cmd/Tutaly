import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdTargetAreas1786000100000 implements MigrationInterface {
  name = 'AddAdTargetAreas1786000100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ad_campaigns" ADD "target_areas" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ad_campaigns" DROP COLUMN "target_areas"`,
    );
  }
}
