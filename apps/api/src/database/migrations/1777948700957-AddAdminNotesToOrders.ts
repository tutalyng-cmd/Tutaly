import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminNotesToOrders1777948700957 implements MigrationInterface {
    name = 'AddAdminNotesToOrders1777948700957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "adminNotes" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "adminNotes"`);
    }
}
