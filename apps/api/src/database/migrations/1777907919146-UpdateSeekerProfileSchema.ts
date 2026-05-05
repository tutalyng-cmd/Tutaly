import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSeekerProfileSchema1777907919146 implements MigrationInterface {
    name = 'UpdateSeekerProfileSchema1777907919146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seeker_profiles" ADD COLUMN IF NOT EXISTS "socialLinks" jsonb DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seeker_profiles" DROP COLUMN IF EXISTS "socialLinks"`);
    }

}
