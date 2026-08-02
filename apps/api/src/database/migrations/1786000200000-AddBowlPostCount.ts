import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBowlPostCount1786000200000 implements MigrationInterface {
    name = 'AddBowlPostCount1786000200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community_bowls" ADD "post_count" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community_bowls" DROP COLUMN "post_count"`);
    }
}
