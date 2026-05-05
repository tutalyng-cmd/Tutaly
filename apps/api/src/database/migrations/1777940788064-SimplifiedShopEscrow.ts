import { MigrationInterface, QueryRunner } from "typeorm";

export class SimplifiedShopEscrow1777940788064 implements MigrationInterface {
    name = 'SimplifiedShopEscrow1777940788064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add earningsReleasedAt column
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "earningsReleasedAt" TIMESTAMP`);

        // Update OrderStatus enum
        // We rename the old one, create new one, and cast the column
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending_payment', 'paid', 'delivered', 'completed', 'flagged', 'refunded')`);
        
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        
        // Map old statuses to new ones
        await queryRunner.query(`
            ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" 
            USING (
                CASE 
                    WHEN "status"::text = 'paid_escrow' THEN 'paid'::"public"."orders_status_enum"
                    WHEN "status"::text = 'complete' THEN 'completed'::"public"."orders_status_enum"
                    WHEN "status"::text = 'auto_complete' THEN 'completed'::"public"."orders_status_enum"
                    WHEN "status"::text = 'disputed' THEN 'flagged'::"public"."orders_status_enum"
                    ELSE "status"::text::"public"."orders_status_enum"
                END
            )
        `);

        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending_payment'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum_old" AS ENUM('pending_payment', 'paid_escrow', 'delivered', 'complete', 'auto_complete', 'disputed', 'refunded')`);
        
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        
        await queryRunner.query(`
            ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum_old" 
            USING (
                CASE 
                    WHEN "status"::text = 'paid' THEN 'paid_escrow'::"public"."orders_status_enum_old"
                    WHEN "status"::text = 'completed' THEN 'complete'::"public"."orders_status_enum_old"
                    WHEN "status"::text = 'flagged' THEN 'disputed'::"public"."orders_status_enum_old"
                    ELSE "status"::text::"public"."orders_status_enum_old"
                END
            )
        `);

        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending_payment'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum_old" RENAME TO "orders_status_enum"`);
        
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "earningsReleasedAt"`);
    }

}
