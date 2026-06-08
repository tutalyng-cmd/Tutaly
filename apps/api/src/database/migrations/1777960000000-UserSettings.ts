import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserSettings1777960000000 implements MigrationInterface {
  name = 'UserSettings1777960000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add new columns to users table
    await queryRunner.query(
      `ALTER TABLE "users" ADD "pendingEmail" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "tokenVersion" integer NOT NULL DEFAULT '0'`,
    );

    // 2. Create user_settings table
    await queryRunner.query(`
      CREATE TABLE "user_settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "notifications" jsonb NOT NULL DEFAULT '{}',
        "privacy" jsonb NOT NULL DEFAULT '{}',
        "cookies" jsonb NOT NULL DEFAULT '{}',
        "userId" uuid,
        CONSTRAINT "UQ_user_settings_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_user_settings" PRIMARY KEY ("id")
      )
    `);

    // 3. Add foreign key from user_settings to users
    await queryRunner.query(`
      ALTER TABLE "user_settings" 
      ADD CONSTRAINT "FK_user_settings_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_user_settings_userId"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tokenVersion"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pendingEmail"`);
  }
}
