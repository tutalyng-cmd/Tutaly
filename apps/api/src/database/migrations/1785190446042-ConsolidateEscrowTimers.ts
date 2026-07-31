import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConsolidateEscrowTimers1785190446042 implements MigrationInterface {
  name = 'ConsolidateEscrowTimers1785190446042';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Data preservation: Map any active auto_confirm_scheduled_at timers to escrowReleaseAt
    await queryRunner.query(
      `UPDATE "orders" SET "escrowReleaseAt" = "auto_confirm_scheduled_at" WHERE "auto_confirm_scheduled_at" IS NOT NULL AND "escrowReleaseAt" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "auto_confirm_scheduled_at"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "auto_confirm_scheduled_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `UPDATE "orders" SET "auto_confirm_scheduled_at" = "escrowReleaseAt" WHERE "escrowReleaseAt" IS NOT NULL AND "auto_confirm_scheduled_at" IS NULL`,
    );
  }
}
