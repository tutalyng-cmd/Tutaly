import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropSellerApprovalGate1785186412562 implements MigrationInterface {
  name = 'DropSellerApprovalGate1785186412562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "seller_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "bio" text NOT NULL, "categoryFocus" character varying NOT NULL, "userId" uuid, CONSTRAINT "REL_49de7dde25d76b120677be9aed" UNIQUE ("userId"), CONSTRAINT "PK_13845670b88adfde01026410969" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`
            INSERT INTO "seller_profiles" ("userId", "bio", "categoryFocus", "createdAt", "updatedAt")
            SELECT DISTINCT ON ("userId") "userId", "bio", "categoryFocus", "createdAt", "updatedAt"
            FROM "seller_applications"
            ORDER BY "userId", "createdAt" DESC;
        `);
    await queryRunner.query(`DROP TABLE "seller_applications"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sellerStatus"`);
    await queryRunner.query(`DROP TYPE "public"."users_sellerstatus_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_46366e52d27edeffdf052f992f"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."reports_targettype_enum" RENAME TO "reports_targettype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reports_targettype_enum" AS ENUM('post', 'comment', 'user', 'listing')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ALTER COLUMN "targetType" TYPE "public"."reports_targettype_enum" USING "targetType"::"text"::"public"."reports_targettype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."reports_targettype_enum_old"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_46366e52d27edeffdf052f992f" ON "reports" ("targetType", "targetId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "seller_profiles" ADD CONSTRAINT "FK_49de7dde25d76b120677be9aedd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "seller_profiles" DROP CONSTRAINT "FK_49de7dde25d76b120677be9aedd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_46366e52d27edeffdf052f992f"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reports_targettype_enum_old" AS ENUM('post', 'comment', 'user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ALTER COLUMN "targetType" TYPE "public"."reports_targettype_enum_old" USING "targetType"::"text"::"public"."reports_targettype_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."reports_targettype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."reports_targettype_enum_old" RENAME TO "reports_targettype_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46366e52d27edeffdf052f992f" ON "reports" ("targetId", "targetType") `,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."users_sellerstatus_enum" AS ENUM('none', 'pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "sellerStatus" "public"."users_sellerstatus_enum" NOT NULL DEFAULT 'none'`,
    );
    await queryRunner.query(
      `CREATE TABLE "seller_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "bio" text NOT NULL, "categoryFocus" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "userId" uuid, "reviewedById" uuid, CONSTRAINT "PK_xxxxxx" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`
            INSERT INTO "seller_applications" ("userId", "bio", "categoryFocus", "status", "createdAt", "updatedAt")
            SELECT "userId", "bio", "categoryFocus", 'approved', "createdAt", "updatedAt"
            FROM "seller_profiles";
        `);
    await queryRunner.query(
      `UPDATE "users" SET "sellerStatus" = 'approved' FROM "seller_profiles" WHERE "users"."id" = "seller_profiles"."userId"`,
    );
    await queryRunner.query(`DROP TABLE "seller_profiles"`);
  }
}
