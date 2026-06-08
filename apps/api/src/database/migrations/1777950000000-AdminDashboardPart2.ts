import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminDashboardPart21777950000000 implements MigrationInterface {
  name = 'AdminDashboardPart21777950000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Create newsletter_sends table ────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "public"."newsletter_sends_audience_enum" AS ENUM ('all', 'seekers', 'employers')
    `);

    await queryRunner.query(`
      CREATE TABLE "newsletter_sends" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "subject" character varying NOT NULL,
        "body" text NOT NULL,
        "audience" "public"."newsletter_sends_audience_enum" NOT NULL DEFAULT 'all',
        "sentAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "recipientCount" integer NOT NULL DEFAULT 0,
        "sentById" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_newsletter_sends" PRIMARY KEY ("id"),
        CONSTRAINT "FK_newsletter_sends_sentBy" FOREIGN KEY ("sentById")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // ─── Create announcements table ──────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "announcements" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying NOT NULL,
        "body" text NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "expiresAt" TIMESTAMP,
        "createdById" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_announcements" PRIMARY KEY ("id"),
        CONSTRAINT "FK_announcements_createdBy" FOREIGN KEY ("createdById")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // ─── Create platform_settings table ────────────────────────
    await queryRunner.query(`
      CREATE TABLE "platform_settings" (
        "key" character varying NOT NULL,
        "value" jsonb NOT NULL,
        "description" character varying,
        "updatedById" character varying,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_platform_settings" PRIMARY KEY ("key")
      )
    `);

    // ─── Seed the 12 legal pages ─────────────────────────────────
    const legalPages = [
      { slug: 'terms-of-service', title: 'Terms of Service' },
      { slug: 'privacy-policy', title: 'Privacy Policy' },
      { slug: 'disclaimer', title: 'Disclaimer' },
      { slug: 'community-guidelines', title: 'Community Guidelines' },
      { slug: 'review-policy', title: 'Review Policy' },
      { slug: 'marketplace-policy', title: 'Marketplace Policy' },
      { slug: 'refund-policy', title: 'Refund Policy' },
      { slug: 'advertiser-policy', title: 'Advertiser Policy' },
      { slug: 'employer-policy', title: 'Employer Policy' },
      { slug: 'cookie-policy', title: 'Cookie Policy' },
      { slug: 'about-us', title: 'About Us' },
      { slug: 'contact-us', title: 'Contact Us' },
    ];

    for (const page of legalPages) {
      // Only insert if the page doesn't already exist
      const exists = await queryRunner.query(
        `SELECT id FROM "legal_pages" WHERE "slug" = $1`,
        [page.slug],
      );
      if (exists.length === 0) {
        await queryRunner.query(
          `INSERT INTO "legal_pages" ("id", "slug", "title", "content", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())`,
          [
            page.slug,
            page.title,
            `<h1>${page.title}</h1><p>This page is under construction. Content will be added soon.</p>`,
          ],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "announcements"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "newsletter_sends"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."newsletter_sends_audience_enum"`,
    );
    // Note: We don't delete the seeded legal pages on rollback — they're data, not schema.
  }
}
