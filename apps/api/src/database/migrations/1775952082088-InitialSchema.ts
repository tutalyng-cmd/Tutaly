import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1775952082088 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Enums
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('seeker', 'employer', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_jobtype_enum" AS ENUM('full-time', 'part-time', 'contract', 'freelance', 'internship')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_experiencelevel_enum" AS ENUM('entry', 'mid', 'senior', 'lead')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_workmode_enum" AS ENUM('remote', 'hybrid', 'onsite')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_status_enum" AS ENUM('pending_review', 'active', 'expired', 'removed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."applications_status_enum" AS ENUM('applied', 'reviewing', 'shortlisted', 'rejected', 'offered')`,
    );

    // Users table
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "email" varchar NOT NULL,
                "password" varchar NOT NULL,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'seeker',
                "isEmailVerified" boolean NOT NULL DEFAULT false,
                "dateOfBirth" date NOT NULL,
                "tosAgreedAt" TIMESTAMP,
                "isActive" boolean NOT NULL DEFAULT true,
                "isMfaEnabled" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_97672df88af87152aed6272e65a" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

    // Seeker Profiles
    await queryRunner.query(`
            CREATE TABLE "seeker_profiles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "firstName" varchar,
                "lastName" varchar,
                "headline" varchar,
                "bio" text,
                "resumeUrl" varchar,
                "skills" text array,
                "location" varchar,
                "userId" uuid,
                CONSTRAINT "REL_7459ef7ac657512ca4f9d0ed2a" UNIQUE ("userId"),
                CONSTRAINT "PK_ec8484bf87498c414fdd6b08098" PRIMARY KEY ("id")
            )
        `);

    // Employer Profiles
    await queryRunner.query(`
            CREATE TABLE "employer_profiles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "companyName" varchar,
                "userId" uuid,
                CONSTRAINT "REL_1d8d9b15b7c7e5a87b7a6d9e8b" UNIQUE ("userId"),
                CONSTRAINT "PK_bc9d9b15b7c7e5a87b7a6d9e8b9" PRIMARY KEY ("id")
            )
        `);

    // Jobs table
    await queryRunner.query(`
            CREATE TABLE "jobs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "title" varchar NOT NULL,
                "description" text NOT NULL,
                "industry" varchar NOT NULL,
                "role" varchar NOT NULL,
                "jobType" "public"."jobs_jobtype_enum" NOT NULL DEFAULT 'full-time',
                "experienceLevel" "public"."jobs_experiencelevel_enum" NOT NULL DEFAULT 'mid',
                "minSalary" integer,
                "maxSalary" integer,
                "currency" varchar NOT NULL DEFAULT 'USD',
                "country" varchar NOT NULL DEFAULT 'Nigeria',
                "state" varchar,
                "area" varchar,
                "location" varchar,
                "workMode" "public"."jobs_workmode_enum" NOT NULL DEFAULT 'onsite',
                "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'pending_review',
                "isFeatured" boolean NOT NULL DEFAULT false,
                "isUrgent" boolean NOT NULL DEFAULT false,
                "deadline" TIMESTAMP,
                "employerId" uuid,
                CONSTRAINT "PK_cf9a305295aa9da078d6_id_seq" PRIMARY KEY ("id")
            )
        `);

    // Applications
    await queryRunner.query(`
            CREATE TABLE "applications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "status" "public"."applications_status_enum" NOT NULL DEFAULT 'applied',
                "coverNote" text,
                "jobId" uuid,
                "seekerId" uuid,
                CONSTRAINT "UQ_application_job_seeker" UNIQUE ("jobId", "seekerId"),
                CONSTRAINT "PK_938c684127a3db1b01ba9a39f68" PRIMARY KEY ("id")
            )
        `);

    // Foreign Keys
    await queryRunner.query(
      `ALTER TABLE "seeker_profiles" ADD CONSTRAINT "FK_7459ef7ac657512ca4f9d0ed2a9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employer_profiles" ADD CONSTRAINT "FK_1d8d9b15b7c7e5a87b7a6d9e8b9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_0846ec568b2f9fa5591c071d0d9" FOREIGN KEY ("employerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_1c8413693fb5f5280ae69752f9c" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_6d9b9c9f0c6c6c6c6c6c6c6c6c6" FOREIGN KEY ("seekerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_6d9b9c9f0c6c6c6c6c6c6c6c6c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_1c8413693fb5f5280ae69752f9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP CONSTRAINT "FK_0846ec568b2f9fa5591c071d0d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employer_profiles" DROP CONSTRAINT "FK_1d8d9b15b7c7e5a87b7a6d9e8b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seeker_profiles" DROP CONSTRAINT "FK_7459ef7ac657512ca4f9d0ed2a9"`,
    );
    await queryRunner.query(`DROP TABLE "applications"`);
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TABLE "employer_profiles"`);
    await queryRunner.query(`DROP TABLE "seeker_profiles"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."applications_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_workmode_enum"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_experiencelevel_enum"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_jobtype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
