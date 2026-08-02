import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommunityUpvotes1785709160786 implements MigrationInterface {
    name = 'AddCommunityUpvotes1785709160786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "community_upvotes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "thread_id" uuid, CONSTRAINT "UQ_3890db44fe1aa2d54ec43337e08" UNIQUE ("user_id", "thread_id"), CONSTRAINT "PK_79fa1e9aaece08051d290055b0e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "community_upvotes" ADD CONSTRAINT "FK_f8540634427efccad97d588e707" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_upvotes" ADD CONSTRAINT "FK_d2aa19d87d81099eedf0958fe10" FOREIGN KEY ("thread_id") REFERENCES "community_threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community_upvotes" DROP CONSTRAINT "FK_d2aa19d87d81099eedf0958fe10"`);
        await queryRunner.query(`ALTER TABLE "community_upvotes" DROP CONSTRAINT "FK_f8540634427efccad97d588e707"`);
        await queryRunner.query(`DROP TABLE "community_upvotes"`);
    }

}
