import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileMediaUrls1777334413684 implements MigrationInterface {
    name = 'AddProfileMediaUrls1777334413684'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seeker_profiles" ADD "avatarUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seeker_profiles" DROP COLUMN "avatarUrl"`);
    }
}
