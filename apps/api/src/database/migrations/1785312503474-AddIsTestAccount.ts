import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsTestAccount1785312503474 implements MigrationInterface {
  name = 'AddIsTestAccount1785312503474';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isTestAccount" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isTestAccount"`);
  }
}
