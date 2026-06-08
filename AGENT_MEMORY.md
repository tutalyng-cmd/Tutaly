# Agent Memory & Development Notes

This file serves as a persistent memory bank for AI agents working on the Tutaly project. It contains critical bug fixes, configuration solutions, and context gathered during previous development sessions. Future agents should read this file when troubleshooting similar issues.

## 1. TypeORM & PostgreSQL Quirks
- **DataTypeNotSupportedError for "Object"**: If TypeORM throws an error saying `Data type "Object" in "Entity.property" is not supported by "postgres"`, it is because the TypeScript type is a union (e.g., `string | null`).
  - **The Fix**: Keep the TypeScript union `string | null` but *explicitly* define the column type in the decorator: `@Column({ type: 'varchar', nullable: true })`.

- **uuid_generate_v4() missing**: If a migration fails because `function uuid_generate_v4() does not exist`, it's because the `uuid-ossp` extension isn't active on the database schema. 
  - **The Fix**: Use PostgreSQL's built-in `gen_random_uuid()` instead of `uuid_generate_v4()` in your migration files.

## 2. NestJS Throttler (429 Too Many Requests)
- Next.js Server-Side Rendering (SSR) fires multiple parallel requests to the NestJS backend to load components. If the `ThrottlerModule` in `app.module.ts` has a strict `short` limit (e.g., 3 requests per 1000ms), Next.js will crash with `429 Too Many Requests`.
  - **The Fix**: Increase the `short` throttler limit to at least `20` requests per `1000ms` for development.

## 3. Next.js Development Server Issues
- **eval() CSP Error**: Next.js throws an `eval() is not supported in this environment` warning if a strict `Content-Security-Policy` is applied. Next.js uses `eval` for hot-reloading in dev.
  - **The Fix**: In `next.config.ts`, conditionally add `'unsafe-eval'` to the `script-src` CSP header *only* when `process.env.NODE_ENV !== 'production'`.

- **Slow Filesystem (OneDrive)**: If Next.js complains about a `Slow filesystem detected` and page loads take 20-40 seconds locally, it is because the project folder is inside a cloud-syncing folder like **OneDrive**. The constant creation of `.next` cache files blocks the filesystem as OneDrive tries to upload them.
  - **The Fix**: The project must be moved to a purely local, non-syncing directory.

## 4. Database Switching (Neon DB)
- **Neon Serverless Postgres**: Neon is fully compatible with this stack. To switch to Neon, simply update the `DATABASE_URL` in `.env`.
  - **Important**: Neon requires SSL. Ensure the connection string ends with `?sslmode=require`, or configure TypeORM with `ssl: { rejectUnauthorized: false }`.

## 5. Network Connectivity Issues (ENOTFOUND)
- If the backend terminal starts spamming `getaddrinfo ENOTFOUND` for Supabase (`aws-1-us-east-1.pooler.supabase.com`) or Upstash Redis (`valued-mole-79728.upstash.io`), it means the local machine has lost internet connectivity or DNS resolution. Restart the server once the internet is restored.

---
*Last Updated: End of Admin Dashboard (Part 2) Frontend Session*
