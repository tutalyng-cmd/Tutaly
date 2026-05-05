import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEmployerProfileSchema1777908361743 implements MigrationInterface {
    name = 'UpdateEmployerProfileSchema1777908361743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employer_profiles" ADD COLUMN IF NOT EXISTS "industry" varchar`);
        await queryRunner.query(`ALTER TABLE "employer_profiles" ADD COLUMN IF NOT EXISTS "website" varchar`);
        await queryRunner.query(`ALTER TABLE "employer_profiles" ADD COLUMN IF NOT EXISTS "companyBio" text`);
        await queryRunner.query(`ALTER TABLE "employer_profiles" ADD COLUMN IF NOT EXISTS "logoUrl" varchar`);
        await queryRunner.query(`ALTER TABLE "employer_profiles" ADD COLUMN IF NOT EXISTS "isVerified" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employer_profiles" DROP COLUMN IF EXISTS "isVerified"`);
        await queryRunner.query(`ALTER TABLE "employer_profiles" DROP COLUMN IF EXISTS "logoUrl"`);
        await queryRunner.query(`ALTER TABLE "employer_profiles" DROP COLUMN IF EXISTS "companyBio"`);
        await queryRunner.query(`ALTER TABLE "employer_profiles" DROP COLUMN IF EXISTS "website"`);
        await queryRunner.query(`ALTER TABLE "employer_profiles" DROP COLUMN IF EXISTS "industry"`);
    }

}
