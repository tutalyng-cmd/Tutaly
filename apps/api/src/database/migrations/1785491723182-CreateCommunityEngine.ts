import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommunityEngine1785491723182 implements MigrationInterface {
    name = 'CreateCommunityEngine1785491723182'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5340fc241f57310d243e5ab20b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_21e65af2f4f242d4c85a92aff4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_692a909ee0fa9383e7859f9b40"`);
        await queryRunner.query(`CREATE TYPE "public"."community_bowls_category_enum" AS ENUM('industry', 'company', 'topic')`);
        await queryRunner.query(`CREATE TABLE "community_bowls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(100) NOT NULL, "slug" character varying(100) NOT NULL, "description" text, "icon_url" text, "category" "public"."community_bowls_category_enum" NOT NULL DEFAULT 'industry', "member_count" integer NOT NULL DEFAULT '0', "company_id" uuid, CONSTRAINT "UQ_fa9554ebaabe1bcdff784741b29" UNIQUE ("slug"), CONSTRAINT "PK_87fec49871386429d5d0b3da2d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."community_threads_anonymity_mode_enum" AS ENUM('full_name', 'job_title_only', 'anonymous_employee')`);
        await queryRunner.query(`CREATE TYPE "public"."community_threads_status_enum" AS ENUM('published', 'flagged', 'deleted')`);
        await queryRunner.query(`CREATE TABLE "community_threads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "anonymity_mode" "public"."community_threads_anonymity_mode_enum" NOT NULL DEFAULT 'job_title_only', "display_title_override" character varying(100), "title" character varying(255) NOT NULL, "content" text NOT NULL, "media_urls" text array, "has_poll" boolean NOT NULL DEFAULT false, "upvotes_count" integer NOT NULL DEFAULT '0', "comments_count" integer NOT NULL DEFAULT '0', "status" "public"."community_threads_status_enum" NOT NULL DEFAULT 'published', "bowl_id" uuid, "user_id" uuid, CONSTRAINT "PK_f841c02a1580a1ac1c49eeb380f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."community_comments_anonymity_mode_enum" AS ENUM('full_name', 'job_title_only', 'anonymous_employee')`);
        await queryRunner.query(`CREATE TABLE "community_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "anonymity_mode" "public"."community_comments_anonymity_mode_enum" NOT NULL DEFAULT 'job_title_only', "display_title_override" character varying(100), "content" text NOT NULL, "upvotes_count" integer NOT NULL DEFAULT '0', "thread_id" uuid, "parent_comment_id" uuid, "user_id" uuid, CONSTRAINT "PK_bddaf18297fe4a6d1cd539586b3" PRIMARY KEY ("id"))`);

        await queryRunner.query(`ALTER TABLE "community_bowls" ADD CONSTRAINT "FK_6c76844410cf98727340d56e237" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_threads" ADD CONSTRAINT "FK_5d7fc0790df79761bfd71a232de" FOREIGN KEY ("bowl_id") REFERENCES "community_bowls"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_threads" ADD CONSTRAINT "FK_d4060c61707a3eb8dd27fda0013" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_comments" ADD CONSTRAINT "FK_7a40e57875c42f3c1e08728b38b" FOREIGN KEY ("thread_id") REFERENCES "community_threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_comments" ADD CONSTRAINT "FK_3cd97c6211ed57e7a84ca4193ef" FOREIGN KEY ("parent_comment_id") REFERENCES "community_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_comments" ADD CONSTRAINT "FK_33fee3b44cd7f14282f537352ae" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community_comments" DROP CONSTRAINT "FK_33fee3b44cd7f14282f537352ae"`);
        await queryRunner.query(`ALTER TABLE "community_comments" DROP CONSTRAINT "FK_3cd97c6211ed57e7a84ca4193ef"`);
        await queryRunner.query(`ALTER TABLE "community_comments" DROP CONSTRAINT "FK_7a40e57875c42f3c1e08728b38b"`);
        await queryRunner.query(`ALTER TABLE "community_threads" DROP CONSTRAINT "FK_d4060c61707a3eb8dd27fda0013"`);
        await queryRunner.query(`ALTER TABLE "community_threads" DROP CONSTRAINT "FK_5d7fc0790df79761bfd71a232de"`);
        await queryRunner.query(`ALTER TABLE "community_bowls" DROP CONSTRAINT "FK_6c76844410cf98727340d56e237"`);



        await queryRunner.query(`DROP TABLE "community_comments"`);
        await queryRunner.query(`DROP TYPE "public"."community_comments_anonymity_mode_enum"`);
        await queryRunner.query(`DROP TABLE "community_threads"`);
        await queryRunner.query(`DROP TYPE "public"."community_threads_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."community_threads_anonymity_mode_enum"`);
        await queryRunner.query(`DROP TABLE "community_bowls"`);
        await queryRunner.query(`DROP TYPE "public"."community_bowls_category_enum"`);

    }

}
