import { MigrationInterface, QueryRunner } from "typeorm";

export class ShopModuleUpdates1777335881515 implements MigrationInterface {
    name = 'ShopModuleUpdates1777335881515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_sellerstatus_enum" AS ENUM('none', 'pending', 'approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "sellerStatus" "public"."users_sellerstatus_enum" NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE "shop_products" ADD "imageUrls" text array`);
        await queryRunner.query(`ALTER TABLE "shop_products" ADD "downloadCount" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_products" DROP COLUMN "downloadCount"`);
        await queryRunner.query(`ALTER TABLE "shop_products" DROP COLUMN "imageUrls"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sellerStatus"`);
        await queryRunner.query(`DROP TYPE "public"."users_sellerstatus_enum"`);
    }

}
