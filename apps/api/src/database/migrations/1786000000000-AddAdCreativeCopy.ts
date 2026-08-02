import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdCreativeCopy1786000000000 implements MigrationInterface {
  name = 'AddAdCreativeCopy1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ad_campaigns" ADD "headline" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "ad_campaigns" ADD "body_text" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ad_campaigns" DROP COLUMN "body_text"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ad_campaigns" DROP COLUMN "headline"`,
    );
  }
}
