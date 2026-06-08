import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStripePaymentGateway1777949000000
  implements MigrationInterface
{
  name = 'AddStripePaymentGateway1777949000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."orders_paymentgateway_enum" ADD VALUE IF NOT EXISTS 'stripe'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: removing an enum value is not natively supported in Postgres without recreating the type.
    // It is safer to leave it as-is for rollback.
  }
}
