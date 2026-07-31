import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImplementCompanyReviews1785451409800 implements MigrationInterface {
  name = 'ImplementCompanyReviews1785451409800';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "logoUrl" text, "industry" character varying(100), "websiteUrl" text, "averageRating" numeric(3,2) NOT NULL DEFAULT '0', "reviewCount" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_b28b07d25e4324eee577de5496d" UNIQUE ("slug"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3dacbb3eb4f095e29372ff8e13" ON "companies" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b28b07d25e4324eee577de5496" ON "companies" ("slug") `,
    );
    await queryRunner.query(
      `CREATE TABLE "review_responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "review_id" uuid NOT NULL, "employer_user_id" uuid NOT NULL, "responseText" text NOT NULL, CONSTRAINT "PK_22e536591de245e6d51965ea5a0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_545198b2a08f4ca06fdaddd275" ON "review_responses" ("review_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d2e7e1e21b1a61098ab75621c6" ON "review_responses" ("employer_user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" DROP COLUMN "sector"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" DROP COLUMN "position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ADD "company_id" uuid`,
    );

    // --- Custom Data Migration ---
    // 1. Create a Company for every unique companyName in company_reviews
    await queryRunner.query(`
            INSERT INTO "companies" (name, slug)
            SELECT DISTINCT "companyName",
            LOWER(REGEXP_REPLACE(REGEXP_REPLACE("companyName", '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g')) as slug
            FROM "company_reviews"
            WHERE "companyName" IS NOT NULL
            ON CONFLICT (slug) DO NOTHING;
        `);

    // 2. Link company_reviews to companies
    await queryRunner.query(`
            UPDATE "company_reviews" cr
            SET "company_id" = c.id
            FROM "companies" c
            WHERE cr."companyName" = c.name;
        `);
    // -----------------------------
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ADD "jobTitle" character varying(150) NOT NULL DEFAULT 'Employee'`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ADD "jobLocation" character varying(150)`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ADD "isCurrentEmployee" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ADD "employmentEndYear" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ADD "reviewTitle" character varying(255) NOT NULL DEFAULT 'Review'`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ADD "helpfulVotes" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ALTER COLUMN "companyName" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ALTER COLUMN "recommend" SET DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3202331a75db12178e557911a" ON "company_reviews" ("company_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ADD CONSTRAINT "FK_a3202331a75db12178e557911a1" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_responses" ADD CONSTRAINT "FK_545198b2a08f4ca06fdaddd2754" FOREIGN KEY ("review_id") REFERENCES "company_reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_responses" ADD CONSTRAINT "FK_d2e7e1e21b1a61098ab75621c6f" FOREIGN KEY ("employer_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "review_responses" DROP CONSTRAINT "FK_d2e7e1e21b1a61098ab75621c6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_responses" DROP CONSTRAINT "FK_545198b2a08f4ca06fdaddd2754"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" DROP CONSTRAINT "FK_a3202331a75db12178e557911a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_21e65af2f4f242d4c85a92aff4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5340fc241f57310d243e5ab20b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3202331a75db12178e557911a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_692a909ee0fa9383e7859f9b40"`,
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "type" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ALTER COLUMN "recommend" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ALTER COLUMN "companyName" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('follow_request', 'follow_accepted', 'post_liked', 'post_commented', 'job_application_status', 'job_approved', 'order_completed', 'order_disputed', 'review_approved', 'seller_application_decision', 'message_received', 'platform_announcement', 'ad_campaign_created', 'ad_under_review', 'ad_approved', 'ad_rejected', 'ad_budget_50', 'ad_budget_80', 'ad_budget_exhausted', 'ad_campaign_ended', 'ad_refund_processed', 'ad_weekly_report')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "type" "public"."notifications_type_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" DROP COLUMN "helpfulVotes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" DROP COLUMN "reviewTitle"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" DROP COLUMN "employmentEndYear"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" DROP COLUMN "isCurrentEmployee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" DROP COLUMN "jobLocation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" DROP COLUMN "jobTitle"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" DROP COLUMN "company_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ADD "position" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_reviews" ADD "sector" character varying`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d2e7e1e21b1a61098ab75621c6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_545198b2a08f4ca06fdaddd275"`,
    );
    await queryRunner.query(`DROP TABLE "review_responses"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b28b07d25e4324eee577de5496"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3dacbb3eb4f095e29372ff8e13"`,
    );
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_692a909ee0fa9383e7859f9b40" ON "notifications" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_21e65af2f4f242d4c85a92aff4" ON "notifications" ("createdAt", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5340fc241f57310d243e5ab20b" ON "notifications" ("isRead", "userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
