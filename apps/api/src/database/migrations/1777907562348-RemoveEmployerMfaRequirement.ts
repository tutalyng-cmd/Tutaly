import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveEmployerMfaRequirement1777907562348 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "users" SET "isMfaEnabled" = false WHERE "role" = 'employer'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "users" SET "isMfaEnabled" = true WHERE "role" = 'employer'`);
    }

}
