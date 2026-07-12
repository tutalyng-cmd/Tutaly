import { MigrationInterface, QueryRunner } from 'typeorm';

export class CommunityEntities1783894145482 implements MigrationInterface {
  name = 'CommunityEntities1783894145482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_user_settings_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP CONSTRAINT "FK_538c9489e98d4874e8db0c4cafd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP CONSTRAINT "FK_7f190f97558c87ec1c14a3d6378"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" DROP CONSTRAINT "FK_77f99ec8e32921d9c29a468c4b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" DROP CONSTRAINT "fk_order_disputes_resolved_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP CONSTRAINT "FK_2b93091c2f4d6c9cf7c9b32e29f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP CONSTRAINT "FK_ac65d744abc05279aee0b290857"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "FK_6999d13aca25e33515210abaf16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" DROP CONSTRAINT "FK_4353be8309ce86650def2f8572d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_acf951a58e3b9611dd96ce89042"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" DROP CONSTRAINT "FK_666a44940ce8279976767c6b5e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" DROP CONSTRAINT "FK_fdb91868b03a2040db408a53331"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_subscriptions_employerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_employerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_subscriptionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`,
    );
    await queryRunner.query(
      `ALTER TABLE "newsletter_sends" DROP CONSTRAINT "FK_newsletter_sends_sentBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcements" DROP CONSTRAINT "FK_announcements_createdBy"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_seeker_profiles_seller_plan"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_shop_products_average_rating"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_shop_products_featured_until"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_shop_products_featured_search_vector"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_538c9489e98d4874e8db0c4caf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7f190f97558c87ec1c14a3d637"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_407d527627ceff1a5590eaba06"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_19d30f9d2260c7a9f1f55fa346"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_payment_audit_order"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_payment_audit_reference"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_payment_audit_gateway"`);
    await queryRunner.query(`DROP INDEX "public"."idx_payment_audit_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_payment_audit_created"`);
    await queryRunner.query(`DROP INDEX "public"."jobs_search_vector_idx"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fccf8ad12448a532feb8127280"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_15ea4c725c1f17facbc53b75e5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_82c4b7dc16c5f5995ce6cf8592"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_692a909ee0fa9383e7859f9b40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" DROP CONSTRAINT "UQ_63cae1eb7767feee4555f00c5f1"`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment_likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "commentId" uuid, "userId" uuid, CONSTRAINT "PK_2c299aaf1f903c45ee7e6c7b419" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ec6698ead14ad945033ebb2f1b" ON "comment_likes" ("commentId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."post_media_mediatype_enum" AS ENUM('image')`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mediaUrl" text NOT NULL, "mediaType" "public"."post_media_mediatype_enum" NOT NULL DEFAULT 'image', "width" integer, "height" integer, "orderIndex" smallint NOT NULL DEFAULT '0', "postId" uuid, CONSTRAINT "PK_049edb1ce7ab3d2a98009b171d0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "saved_posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "postId" uuid, CONSTRAINT "UQ_4d3790479b4ace0798f7d54c551" UNIQUE ("userId", "postId"), CONSTRAINT "PK_868375ca4f041a2337a1c1a6634" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2b1d571903f71883bc942f2ed" ON "saved_posts" ("userId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."connect_notifications_type_enum" AS ENUM('post_like', 'post_comment', 'comment_reply', 'comment_like', 'new_follower')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."connect_notifications_targettype_enum" AS ENUM('post', 'comment', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "connect_notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."connect_notifications_type_enum" NOT NULL, "targetType" "public"."connect_notifications_targettype_enum" NOT NULL, "targetId" uuid NOT NULL, "readAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "recipientId" uuid, "actorId" uuid, CONSTRAINT "PK_eccdd5dfb9b0b564053fa8073f7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_49886606f63bad87b36363d9a8" ON "connect_notifications" ("recipientId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "blocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "blockerId" uuid, "blockedId" uuid, CONSTRAINT "UQ_4abe7bad89347a663fc8f428d0d" UNIQUE ("blockerId", "blockedId"), CONSTRAINT "CHK_200dccc70b6dbc088ea9a3ff68" CHECK ("blockerId" != "blockedId"), CONSTRAINT "PK_8244fa1495c4e9222a01059244b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b87401da081a7153ec3bd1e6ab" ON "blocks" ("blockedId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ed8a33b2c1ac10922c2354f5cf" ON "blocks" ("blockerId") `,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "issuspended"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isdeleted"`);
    await queryRunner.query(
      `ALTER TABLE "shop_products" DROP COLUMN "averagerating"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_products" DROP COLUMN "totalratings"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_products" DROP COLUMN "ratingdistribution"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "buyer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "is_verified_purchase"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "order_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "confirmedat"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "autoconfirmscheduledat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" DROP COLUMN "resolutionNotes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" DROP COLUMN "resolvedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" DROP COLUMN "resolvedById"`,
    );
    await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "content" TO "body"`,
    );
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "imageUrl"`);
    // --- DATA MIGRATION START ---
    const posts = await queryRunner.query(
      'SELECT id, "imageUrls" FROM "posts" WHERE "imageUrls" IS NOT NULL AND array_length("imageUrls", 1) > 0',
    );
    for (const post of posts) {
      let orderIndex = 0;
      for (const url of post.imageUrls) {
        await queryRunner.query(
          'INSERT INTO "post_media" ("postId", "mediaUrl", "mediaType", "orderIndex") VALUES ($1, $2, $3, $4)',
          [post.id, url, 'image', orderIndex],
        );
        orderIndex++;
      }
    }
    // --- DATA MIGRATION END ---

    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "imageUrls"`);
    await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "post_shares" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "followeeId"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "isVerifiedPurchase" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "orderId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "productId" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "product_ratings" ADD "buyerId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD "likesCount" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD "parentCommentId" uuid`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."posts_visibility_enum" AS ENUM('public', 'connections_only')`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "visibility" "public"."posts_visibility_enum" NOT NULL DEFAULT 'public'`,
    );
    await queryRunner.query(`ALTER TABLE "posts" ADD "editedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "posts" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "reports" ADD "details" text`);
    await queryRunner.query(
      `CREATE TYPE "public"."reports_status_enum" AS ENUM('pending', 'reviewed_actioned', 'reviewed_dismissed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD "status" "public"."reports_status_enum" NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(`ALTER TABLE "reports" ADD "reviewedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "reports" ADD "reviewedBy" uuid`);
    await queryRunner.query(`ALTER TABLE "follows" ADD "acceptedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "follows" ADD "followingId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "seeker_profiles" DROP COLUMN "contact_phone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seeker_profiles" ADD "contact_phone" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "seeker_profiles" DROP COLUMN "contact_whatsapp"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seeker_profiles" ADD "contact_whatsapp" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "contact_phone"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "contact_phone" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "whatsapp_phone"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "whatsapp_phone" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_products" ALTER COLUMN "rating_distribution" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ALTER COLUMN "rating" SET DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_transaction_audit" DROP CONSTRAINT "FK_3a25a0d453b0956c52d45fc871f"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."gateway" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."reference" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."status" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."gatewayResponse" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."errorMessage" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."idempotencyKey" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_transaction_audit" ALTER COLUMN "orderId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" RENAME COLUMN "search_vector" TO "TEMP_OLD_search_vector"`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" ADD "search_vector" tsvector`);
    await queryRunner.query(
      `UPDATE "jobs" SET "search_vector" = "TEMP_OLD_search_vector"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP COLUMN "TEMP_OLD_search_vector"`,
    );
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ['GENERATED_COLUMN', 'search_vector', 'postgres', 'public', 'jobs'],
    );
    await queryRunner.query(
      `ALTER TYPE "public"."reports_targettype_enum" RENAME TO "reports_targettype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reports_targettype_enum" AS ENUM('post', 'comment', 'user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ALTER COLUMN "targetType" TYPE "public"."reports_targettype_enum" USING "targetType"::"text"::"public"."reports_targettype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."reports_targettype_enum_old"`);
    await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "reason"`);
    await queryRunner.query(
      `CREATE TYPE "public"."reports_reason_enum" AS ENUM('spam', 'harassment', 'misinformation', 'inappropriate_content', 'other')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD "reason" "public"."reports_reason_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" DROP CONSTRAINT "FK_15ea4c725c1f17facbc53b75e53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" DROP CONSTRAINT "FK_95c8a0c593c2320addcc7af1468"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" ALTER COLUMN "originalPostId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" ALTER COLUMN "sharedById" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" ALTER COLUMN "status" SET DEFAULT 'accepted'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('follow_request', 'follow_accepted', 'post_liked', 'post_commented', 'job_application_status', 'job_approved', 'order_completed', 'order_disputed', 'review_approved', 'seller_application_decision', 'message_received', 'platform_announcement', 'ad_campaign_created', 'ad_under_review', 'ad_approved', 'ad_rejected', 'ad_budget_50', 'ad_budget_80', 'ad_budget_exhausted', 'ad_campaign_ended', 'ad_refund_processed', 'ad_weekly_report')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_692a909ee0fa9383e7859f9b40" ON "notifications" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_993f8cb0705c30d5831eb8a997" ON "product_ratings" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7fb4174621654595a90dc1fcbf" ON "product_ratings" ("buyerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1755b3b00e1d9f8cad4632324d" ON "product_ratings" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f507ad1fe17ee792435ef5d1fb" ON "post_comments" ("postId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6999d13aca25e33515210abaf1" ON "post_likes" ("postId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46bc204f43827b6f25e0133dbf" ON "posts" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_781a2c0adee4125f1f6906a14a" ON "reports" ("status", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46366e52d27edeffdf052f992f" ON "reports" ("targetType", "targetId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef463dd9a2ce0d673350e36e0f" ON "follows" ("followingId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fdb91868b03a2040db408a5333" ON "follows" ("followerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ffe1a0dd18b12c71c182381d27" ON "follows" ("followingId", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d32d01e270a821b03fa7089b3" ON "follows" ("followerId", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5340fc241f57310d243e5ab20b" ON "notifications" ("userId", "isRead") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_21e65af2f4f242d4c85a92aff4" ON "notifications" ("userId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" ADD CONSTRAINT "CHK_bc9e461b402f69082ba2618108" CHECK ("followerId" != "followingId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD CONSTRAINT "UQ_d5c8af8c4ed11fad6f63c50f7a6" UNIQUE ("productId", "buyerId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" ADD CONSTRAINT "UQ_105079775692df1f8799ed0fac8" UNIQUE ("followerId", "followingId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD CONSTRAINT "FK_1755b3b00e1d9f8cad4632324db" FOREIGN KEY ("productId") REFERENCES "shop_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD CONSTRAINT "FK_7fb4174621654595a90dc1fcbf3" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" ADD CONSTRAINT "FK_dbfcae8c201fe56e5404e680096" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_transaction_audit" ADD CONSTRAINT "FK_3a25a0d453b0956c52d45fc871f" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_abbd506a94a424dd6a3a68d26f4" FOREIGN KEY ("commentId") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD CONSTRAINT "FK_ac65d744abc05279aee0b290857" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD CONSTRAINT "FK_2b93091c2f4d6c9cf7c9b32e29f" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD CONSTRAINT "FK_2f4fd3e12513addbc37a4e6d56e" FOREIGN KEY ("parentCommentId") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "FK_6999d13aca25e33515210abaf16" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_media" ADD CONSTRAINT "FK_4adcc5190e3b5c7e9001adef3b8" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_posts" ADD CONSTRAINT "FK_2a6ac38aa1767f692d4f492639b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_posts" ADD CONSTRAINT "FK_4704fa96cd2b591592a8cfaee56" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD CONSTRAINT "FK_4353be8309ce86650def2f8572d" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" ADD CONSTRAINT "FK_15ea4c725c1f17facbc53b75e53" FOREIGN KEY ("originalPostId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" ADD CONSTRAINT "FK_95c8a0c593c2320addcc7af1468" FOREIGN KEY ("sharedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_acf951a58e3b9611dd96ce89042" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" ADD CONSTRAINT "FK_fdb91868b03a2040db408a53331" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" ADD CONSTRAINT "FK_ef463dd9a2ce0d673350e36e0fb" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connect_notifications" ADD CONSTRAINT "FK_ad1b4b48ebad5c770ca6e006cdd" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connect_notifications" ADD CONSTRAINT "FK_d1b5ce51243f5f23556311bd99d" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "blocks" ADD CONSTRAINT "FK_ed8a33b2c1ac10922c2354f5cfc" FOREIGN KEY ("blockerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "blocks" ADD CONSTRAINT "FK_b87401da081a7153ec3bd1e6ab6" FOREIGN KEY ("blockedId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fba378620dd886dfcbc8bf9de81" FOREIGN KEY ("employerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_2c09534a63cf2e612ab2ca3a252" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_1e9831df01480dbe7bc3c67057e" FOREIGN KEY ("employerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "newsletter_sends" ADD CONSTRAINT "FK_8a8178231661de0cf113f92a605" FOREIGN KEY ("sentById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcements" ADD CONSTRAINT "FK_197a06ce0989e489974fdc26ca8" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcements" DROP CONSTRAINT "FK_197a06ce0989e489974fdc26ca8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "newsletter_sends" DROP CONSTRAINT "FK_8a8178231661de0cf113f92a605"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_1e9831df01480dbe7bc3c67057e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_2c09534a63cf2e612ab2ca3a252"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fba378620dd886dfcbc8bf9de81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blocks" DROP CONSTRAINT "FK_b87401da081a7153ec3bd1e6ab6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blocks" DROP CONSTRAINT "FK_ed8a33b2c1ac10922c2354f5cfc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "connect_notifications" DROP CONSTRAINT "FK_d1b5ce51243f5f23556311bd99d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "connect_notifications" DROP CONSTRAINT "FK_ad1b4b48ebad5c770ca6e006cdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" DROP CONSTRAINT "FK_ef463dd9a2ce0d673350e36e0fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" DROP CONSTRAINT "FK_fdb91868b03a2040db408a53331"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_acf951a58e3b9611dd96ce89042"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" DROP CONSTRAINT "FK_95c8a0c593c2320addcc7af1468"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" DROP CONSTRAINT "FK_15ea4c725c1f17facbc53b75e53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" DROP CONSTRAINT "FK_4353be8309ce86650def2f8572d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_posts" DROP CONSTRAINT "FK_4704fa96cd2b591592a8cfaee56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_posts" DROP CONSTRAINT "FK_2a6ac38aa1767f692d4f492639b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_media" DROP CONSTRAINT "FK_4adcc5190e3b5c7e9001adef3b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "FK_6999d13aca25e33515210abaf16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP CONSTRAINT "FK_2f4fd3e12513addbc37a4e6d56e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP CONSTRAINT "FK_2b93091c2f4d6c9cf7c9b32e29f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP CONSTRAINT "FK_ac65d744abc05279aee0b290857"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_abbd506a94a424dd6a3a68d26f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_transaction_audit" DROP CONSTRAINT "FK_3a25a0d453b0956c52d45fc871f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" DROP CONSTRAINT "FK_dbfcae8c201fe56e5404e680096"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP CONSTRAINT "FK_7fb4174621654595a90dc1fcbf3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP CONSTRAINT "FK_1755b3b00e1d9f8cad4632324db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" DROP CONSTRAINT "UQ_105079775692df1f8799ed0fac8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP CONSTRAINT "UQ_d5c8af8c4ed11fad6f63c50f7a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" DROP CONSTRAINT "CHK_bc9e461b402f69082ba2618108"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_21e65af2f4f242d4c85a92aff4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5340fc241f57310d243e5ab20b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7d32d01e270a821b03fa7089b3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ffe1a0dd18b12c71c182381d27"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fdb91868b03a2040db408a5333"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ef463dd9a2ce0d673350e36e0f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_46366e52d27edeffdf052f992f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_781a2c0adee4125f1f6906a14a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_46bc204f43827b6f25e0133dbf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6999d13aca25e33515210abaf1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f507ad1fe17ee792435ef5d1fb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1755b3b00e1d9f8cad4632324d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7fb4174621654595a90dc1fcbf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_993f8cb0705c30d5831eb8a997"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_692a909ee0fa9383e7859f9b40"`,
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "type" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" ALTER COLUMN "sharedById" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" ALTER COLUMN "originalPostId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" ADD CONSTRAINT "FK_95c8a0c593c2320addcc7af1468" FOREIGN KEY ("sharedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" ADD CONSTRAINT "FK_15ea4c725c1f17facbc53b75e53" FOREIGN KEY ("originalPostId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "reason"`);
    await queryRunner.query(`DROP TYPE "public"."reports_reason_enum"`);
    await queryRunner.query(`ALTER TABLE "reports" ADD "reason" text NOT NULL`);
    await queryRunner.query(
      `CREATE TYPE "public"."reports_targettype_enum_old" AS ENUM('job', 'post', 'review', 'user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ALTER COLUMN "targetType" TYPE "public"."reports_targettype_enum_old" USING "targetType"::"text"::"public"."reports_targettype_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."reports_targettype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."reports_targettype_enum_old" RENAME TO "reports_targettype_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "search_vector"`);
    await queryRunner.query(`ALTER TABLE "jobs" ADD "search_vector" tsvector`);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      ['postgres', 'public', 'jobs', 'GENERATED_COLUMN', 'search_vector', ''],
    );
    await queryRunner.query(
      `ALTER TABLE "payment_transaction_audit" ALTER COLUMN "orderId" SET NOT NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."idempotencyKey" IS 'For preventing duplicate processing'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."errorMessage" IS 'Error details if transaction failed'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."gatewayResponse" IS 'Full response from payment gateway for debugging'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."status" IS 'initiated, pending, successful, failed, refunded, etc.'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."reference" IS 'Payment reference from gateway'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payment_transaction_audit"."gateway" IS 'flutterwave, paystack, etc.'`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_transaction_audit" ADD CONSTRAINT "FK_3a25a0d453b0956c52d45fc871f" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ALTER COLUMN "rating" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_products" ALTER COLUMN "rating_distribution" SET DEFAULT '{}'`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "whatsapp_phone"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "whatsapp_phone" character varying(20)`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "contact_phone"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "contact_phone" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "seeker_profiles" DROP COLUMN "contact_whatsapp"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seeker_profiles" ADD "contact_whatsapp" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "seeker_profiles" DROP COLUMN "contact_phone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seeker_profiles" ADD "contact_phone" character varying(20)`,
    );
    await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "followingId"`);
    await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "acceptedAt"`);
    await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "reviewedBy"`);
    await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "reviewedAt"`);
    await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."reports_status_enum"`);
    await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "details"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "editedAt"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "visibility"`);
    await queryRunner.query(`DROP TYPE "public"."posts_visibility_enum"`);
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "body" TO "content"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP COLUMN "parentCommentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP COLUMN "likesCount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "buyerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "orderId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "isVerifiedPurchase"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "follows" ADD "followeeId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "follows" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_shares" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "imageUrls" character varying array`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "imageUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" ADD "resolvedById" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" ADD "resolvedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" ADD "resolutionNotes" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "autoconfirmscheduledat" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "orders" ADD "confirmedat" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "order_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "is_verified_purchase" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "buyer_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD "product_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_products" ADD "ratingdistribution" jsonb DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_products" ADD "totalratings" integer DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_products" ADD "averagerating" numeric(3,2) DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isdeleted" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "issuspended" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ed8a33b2c1ac10922c2354f5cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b87401da081a7153ec3bd1e6ab"`,
    );
    await queryRunner.query(`DROP TABLE "blocks"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_49886606f63bad87b36363d9a8"`,
    );
    await queryRunner.query(`DROP TABLE "connect_notifications"`);
    await queryRunner.query(
      `DROP TYPE "public"."connect_notifications_targettype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."connect_notifications_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2b1d571903f71883bc942f2ed"`,
    );
    await queryRunner.query(`DROP TABLE "saved_posts"`);
    await queryRunner.query(`DROP TABLE "post_media"`);
    await queryRunner.query(`DROP TYPE "public"."post_media_mediatype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ec6698ead14ad945033ebb2f1b"`,
    );
    await queryRunner.query(`DROP TABLE "comment_likes"`);
    await queryRunner.query(
      `ALTER TABLE "follows" ADD CONSTRAINT "UQ_63cae1eb7767feee4555f00c5f1" UNIQUE ("followerId", "followeeId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_692a909ee0fa9383e7859f9b40" ON "notifications" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_82c4b7dc16c5f5995ce6cf8592" ON "post_shares" ("createdAt", "sharedById") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_15ea4c725c1f17facbc53b75e5" ON "post_shares" ("originalPostId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fccf8ad12448a532feb8127280" ON "posts" ("createdAt", "id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "jobs_search_vector_idx" ON "jobs" ("search_vector") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payment_audit_created" ON "payment_transaction_audit" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payment_audit_status" ON "payment_transaction_audit" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payment_audit_gateway" ON "payment_transaction_audit" ("gateway") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payment_audit_reference" ON "payment_transaction_audit" ("reference") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payment_audit_order" ON "payment_transaction_audit" ("orderId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_19d30f9d2260c7a9f1f55fa346" ON "product_ratings" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_407d527627ceff1a5590eaba06" ON "product_ratings" ("buyer_id", "product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7f190f97558c87ec1c14a3d637" ON "product_ratings" ("buyer_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_538c9489e98d4874e8db0c4caf" ON "product_ratings" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shop_products_featured_search_vector" ON "shop_products" ("featured_search_vector") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shop_products_featured_until" ON "shop_products" ("featured_until") WHERE (featured_until IS NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shop_products_average_rating" ON "shop_products" ("average_rating") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_seeker_profiles_seller_plan" ON "seeker_profiles" ("seller_plan") `,
    );
    await queryRunner.query(
      `ALTER TABLE "announcements" ADD CONSTRAINT "FK_announcements_createdBy" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "newsletter_sends" ADD CONSTRAINT "FK_newsletter_sends_sentBy" FOREIGN KEY ("sentById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_subscriptionId" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_employerId" FOREIGN KEY ("employerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_subscriptions_employerId" FOREIGN KEY ("employerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" ADD CONSTRAINT "FK_fdb91868b03a2040db408a53331" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" ADD CONSTRAINT "FK_666a44940ce8279976767c6b5e3" FOREIGN KEY ("followeeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_acf951a58e3b9611dd96ce89042" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD CONSTRAINT "FK_4353be8309ce86650def2f8572d" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "FK_6999d13aca25e33515210abaf16" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD CONSTRAINT "FK_ac65d744abc05279aee0b290857" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD CONSTRAINT "FK_2b93091c2f4d6c9cf7c9b32e29f" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" ADD CONSTRAINT "fk_order_disputes_resolved_by_id" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_disputes" ADD CONSTRAINT "FK_77f99ec8e32921d9c29a468c4b6" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD CONSTRAINT "FK_7f190f97558c87ec1c14a3d6378" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_ratings" ADD CONSTRAINT "FK_538c9489e98d4874e8db0c4cafd" FOREIGN KEY ("product_id") REFERENCES "shop_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_user_settings_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
