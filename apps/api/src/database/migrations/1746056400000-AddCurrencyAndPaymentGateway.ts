import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCurrencyAndPaymentGateway1746056400000 implements MigrationInterface {
    name = 'AddCurrencyAndPaymentGateway1746056400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create currency enum
        await queryRunner.query(`CREATE TYPE "public"."shop_products_currency_enum" AS ENUM('NGN', 'USD', 'EUR')`);
        // Add currency to shop_products
        await queryRunner.query(`ALTER TABLE "shop_products" ADD "currency" "public"."shop_products_currency_enum" NOT NULL DEFAULT 'NGN'`);

        // Create order currency enum (reuse same values)
        await queryRunner.query(`CREATE TYPE "public"."orders_currency_enum" AS ENUM('NGN', 'USD', 'EUR')`);
        // Add currency to orders
        await queryRunner.query(`ALTER TABLE "orders" ADD "currency" "public"."orders_currency_enum" NOT NULL DEFAULT 'NGN'`);

        // Create payment gateway enum
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentgateway_enum" AS ENUM('flutterwave', 'paystack')`);
        // Add paymentGateway to orders
        await queryRunner.query(`ALTER TABLE "orders" ADD "paymentGateway" "public"."orders_paymentgateway_enum" NOT NULL DEFAULT 'flutterwave'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paymentGateway"`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentgateway_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "currency"`);
        await queryRunner.query(`DROP TYPE "public"."orders_currency_enum"`);
        await queryRunner.query(`ALTER TABLE "shop_products" DROP COLUMN "currency"`);
        await queryRunner.query(`DROP TYPE "public"."shop_products_currency_enum"`);
    }
}
