import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSalaryEngine1785483605304 implements MigrationInterface {
    name = 'AddSalaryEngine1785483605304'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`CREATE TABLE "salaries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "company_id" uuid, "user_id" uuid, "job_title" character varying(150) NOT NULL, "canonical_job_title" character varying(150) NOT NULL, "location" character varying(150) NOT NULL, "base_pay" numeric(12,2) NOT NULL, "pay_period" character varying(20) NOT NULL DEFAULT 'yearly', "bonus_pay" numeric(12,2) NOT NULL DEFAULT '0', "years_experience" integer, "status" character varying(20) NOT NULL DEFAULT 'approved', CONSTRAINT "PK_20ca60aa8d4201c7bcb430fdb36" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6155d4dbce69bbf1ebd08e0eb7" ON "salaries" ("company_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_9f61c95a7ba0b28c58b1d0bc67" ON "salaries" ("canonical_job_title") `);
        await queryRunner.query(`CREATE INDEX "IDX_0982701f3169a31eca30e48ddd" ON "salaries" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_42b171005631ae19e6b93a3353" ON "salaries" ("status") `);
        await queryRunner.query(`CREATE TABLE "salary_aggregates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "canonical_job_title" character varying(150) NOT NULL, "location" character varying(150) NOT NULL DEFAULT 'ALL', "median_pay" numeric(12,2) NOT NULL, "p25_pay" numeric(12,2) NOT NULL, "p75_pay" numeric(12,2) NOT NULL, "min_pay" numeric(12,2) NOT NULL, "max_pay" numeric(12,2) NOT NULL, "sample_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_33f202a3bf7f0f29006a45d658d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b7a73106f8ff7b7bb23b06dc49" ON "salary_aggregates" ("canonical_job_title", "location") `);

        await queryRunner.query(`ALTER TABLE "salaries" ADD CONSTRAINT "FK_6155d4dbce69bbf1ebd08e0eb7a" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "salaries" ADD CONSTRAINT "FK_c12591382bdd41fa79264f339e0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salaries" DROP CONSTRAINT "FK_c12591382bdd41fa79264f339e0"`);
        await queryRunner.query(`ALTER TABLE "salaries" DROP CONSTRAINT "FK_6155d4dbce69bbf1ebd08e0eb7a"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_21e65af2f4f242d4c85a92aff4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5340fc241f57310d243e5ab20b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_692a909ee0fa9383e7859f9b40"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company_reviews" ALTER COLUMN "reviewTitle" SET DEFAULT 'Review'`);
        await queryRunner.query(`ALTER TABLE "company_reviews" ALTER COLUMN "isCurrentEmployee" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "company_reviews" ALTER COLUMN "jobTitle" SET DEFAULT 'Employee'`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('follow_request', 'follow_accepted', 'post_liked', 'post_commented', 'job_application_status', 'job_approved', 'order_completed', 'order_disputed', 'review_approved', 'seller_application_decision', 'message_received', 'platform_announcement', 'ad_campaign_created', 'ad_under_review', 'ad_approved', 'ad_rejected', 'ad_budget_50', 'ad_budget_80', 'ad_budget_exhausted', 'ad_campaign_ended', 'ad_refund_processed', 'ad_weekly_report')`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "type" "public"."notifications_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b7a73106f8ff7b7bb23b06dc49"`);
        await queryRunner.query(`DROP TABLE "salary_aggregates"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_42b171005631ae19e6b93a3353"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0982701f3169a31eca30e48ddd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9f61c95a7ba0b28c58b1d0bc67"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6155d4dbce69bbf1ebd08e0eb7"`);
        await queryRunner.query(`DROP TABLE "salaries"`);
        await queryRunner.query(`CREATE INDEX "IDX_692a909ee0fa9383e7859f9b40" ON "notifications" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_21e65af2f4f242d4c85a92aff4" ON "notifications" ("createdAt", "userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5340fc241f57310d243e5ab20b" ON "notifications" ("isRead", "userId") `);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
