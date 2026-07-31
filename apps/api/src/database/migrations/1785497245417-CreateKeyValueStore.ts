import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateKeyValueStore1785497245417 implements MigrationInterface {
    name = 'CreateKeyValueStore1785497245417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "key_value_store" ("key" character varying(255) NOT NULL, "value" text NOT NULL, "expiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_519a723c36782c7cfa315b9969a" PRIMARY KEY ("key"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "key_value_store"`);
    }

}
