import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyFilters1785481991781 implements MigrationInterface {
  name = 'AddCompanyFilters1785481991781';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "location" character varying(150)`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "companySize" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingCulture" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingDiversity" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingWorkLife" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingCompensation" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingCareer" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingManagement" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingRace" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingGender" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingSexualOrientation" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingDisability" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingParent" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "ratingVeterans" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "ratingVeterans"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "ratingParent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "ratingDisability"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "ratingSexualOrientation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "ratingGender"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "ratingRace"`);
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "ratingManagement"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "ratingCareer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "ratingCompensation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "ratingWorkLife"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "ratingDiversity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "ratingCulture"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "companySize"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "location"`);
  }
}
