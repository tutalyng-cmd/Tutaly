# TUTALY — COMPLETE BACKEND AUDIT PROMPT
# Senior Engineer & Security Specialist Audit
# Version 1.0 | June 2026

---

## YOUR ROLE FOR THIS AUDIT

You are a senior software engineer and security specialist
with 10+ years of production experience. You have audited
backends for fintech platforms, marketplaces, and
professional networks at scale. You are thorough,
direct, and you do not sugarcoat findings.

Your job right now is to conduct a COMPLETE audit of the
Tutaly NestJS backend. You will read every file, check
every module, verify every business rule, and produce a
detailed report of what is correct, what is broken, what
is missing, and what is a security risk.

You do not write any new code during this audit.
You do not fix anything during this audit.
You READ, ANALYSE, and REPORT only.

After the audit is complete you will present your findings
and wait for approval before touching a single line of code.

---

## STEP 1 — CODEBASE ORIENTATION (DO THIS FIRST)

Before anything else run these commands to understand
the current state of the codebase:

```bash
# 1. See the full project structure
find apps/api/src -type f -name "*.ts" | sort

# 2. See all implemented API endpoints
grep -r "@Get\|@Post\|@Put\|@Patch\|@Delete" \
  apps/api/src --include="*.ts" -l

# 3. See all entities (database tables)
find apps/api/src -name "*.entity.ts" | sort

# 4. See all DTOs (request validation)
find apps/api/src -name "*.dto.ts" | sort

# 5. See all guards (auth protection)
find apps/api/src -name "*.guard.ts" | sort

# 6. See all services (business logic)
find apps/api/src -name "*.service.ts" | sort

# 7. See all migrations
find apps/api/src -name "*migration*" \
  -o -name "*Migration*" | sort

# 8. See recent git commits
git log --oneline -30

# 9. Check current lint status
cd apps/api && pnpm run lint 2>&1 | tail -20

# 10. Check migration status against database
cd apps/api && pnpm migration:show

# 11. See all modules registered
cat apps/api/src/app.module.ts

# 12. See main.ts configuration
cat apps/api/src/main.ts

# 13. Check package.json for all dependencies
cat apps/api/package.json
```

Read every file found. Do not skip any file.
Do not assume what a file contains — read it.

---

## STEP 2 — MODULES TO AUDIT (IN THIS ORDER)

Audit each module completely before moving to the next.
For each module read: entity, service, controller, DTOs,
guards, and any other files in the module folder.

### MODULE 1 — AUTH
Path: apps/api/src/modules/auth/

Check every item:

REGISTRATION:
□ POST /auth/register exists and works
□ Seeker and employer roles both handled
□ Age 18+ validation enforced server-side
□ Terms of Service timestamp (tos_agreed_at) logged in DB
□ Password hashed with bcrypt 12 rounds
□ Plain text password never stored or logged
□ Email verification token generated and sent via SendGrid
□ Token expires after 24 hours
□ User created with status: unverified until email confirmed
□ reCAPTCHA v3 verified server-side (not just collected)
□ Admin role cannot be registered via this endpoint
□ Password complexity enforced (uppercase + lowercase +
  digit + special character + minimum 8 chars)
□ Email enumeration prevention (same response whether
  email exists or not on registration)

EMAIL VERIFICATION:
□ GET or POST /auth/verify-email exists
□ Token validated (not expired, not already used)
□ email_verified set to true on success
□ Token marked as used after verification
□ JWT tokens issued after verification

LOGIN:
□ POST /auth/login exists
□ Email + password validated
□ Email verified check enforced before granting access
□ Account status check (suspended users cannot login)
□ JWT access token issued (15 minute expiry)
□ Refresh token set as httpOnly cookie (7 day expiry)
□ Refresh token stored in Redis
□ Wrong password does not reveal whether email exists
□ Password field has select: false on User entity

TOKEN REFRESH:
□ POST /auth/refresh exists
□ Reads refresh token from httpOnly cookie
□ Validates token exists in Redis
□ Issues new access token
□ Rotates refresh token (old one invalidated in Redis)
□ New httpOnly cookie set with new refresh token

PASSWORD RESET:
□ POST /auth/forgot-password exists
□ Always returns 200 regardless of email existence
□ Reset token generated using crypto (not Math.random())
□ Token expires after 1 hour
□ SendGrid email sent with reset link
□ POST /auth/reset-password exists
□ Token validated (not expired, not used)
□ New password hashed with bcrypt 12 rounds
□ Token marked as used
□ ALL existing refresh tokens invalidated in Redis
□ User cannot use same reset link twice

CHANGE PASSWORD:
□ PUT /auth/change-password exists
□ Requires current password verification
□ New password hashed and saved
□ Other sessions invalidated

LOGOUT:
□ POST /auth/logout exists
□ Refresh token revoked in Redis
□ httpOnly cookie cleared
□ Returns 200

ACCOUNT DELETION:
□ DELETE /auth/account exists
□ Requires password confirmation
□ Soft delete — user_status set to deleted
□ Personal data anonymised (name → Deleted User,
  email → hashed)
□ All active sessions invalidated
□ Seller listings removed or marked inactive
□ Active jobs removed

MFA:
□ MFA implemented for Employer and Admin accounts
□ MFA mandatory — cannot be bypassed
□ MFA enforced at service level not just frontend

JWT STRATEGY:
□ JWT strategy registered in NestJS
□ Access token payload contains: user_id, role, email
□ Access token expiry: 15 minutes
□ RS256 or HS256 signing

RATE LIMITING:
□ Auth routes rate limited (5 requests per minute per IP)
□ Throttler configured for auth module specifically

SECURITY CHECKS:
□ OTP uses crypto.randomInt() — NOT Math.random()
□ sameSite: strict on ALL cookie writes
  (login, MFA verify, refresh — must be consistent)
□ No sensitive data in JWT payload
  (no passwords, no full personal data)

---

### MODULE 2 — USER (PROFILES)
Path: apps/api/src/modules/user/

SEEKER PROFILE:
□ GET /users/seeker/profile — returns own profile
□ PATCH /users/seeker/profile — updates bio, skills,
  headline, location, social links
□ POST /users/seeker/resume — CV upload
□ CV stored in Supabase Storage private bucket 'resumes'
□ NOT stored on local disk (DiskStorage must not be used)
□ PDF only validation server-side (not just client)
□ 5MB max file size enforced server-side
□ resumeUrl saved to SeekerProfile after upload
□ File S3/Supabase key never returned in API response
□ Signed URL generated for accessing CV

EMPLOYER PROFILE:
□ GET /users/employer/profile
□ PATCH /users/employer/profile — company name, about,
  sector, size, website, social links
□ POST /users/employer/logo — logo upload
□ Logo stored in Supabase Storage
□ isVerified field exists on entity
□ Admin can toggle isVerified

PROFILE ENTITY CHECKS:
□ SeekerProfile has 1-to-1 FK to User
  with ON DELETE CASCADE
□ EmployerProfile has 1-to-1 FK to User
  with ON DELETE CASCADE
□ seller_status field exists on SeekerProfile:
  none | pending | approved | suspended
□ profile_visibility field: public | connections
□ follow_approval field: auto | manual
□ skills stored as PostgreSQL TEXT array

SETTINGS:
□ PATCH /users/settings/notifications — all categories
□ PATCH /users/settings/privacy — visibility settings
□ PATCH /users/settings/email — change email with
  verification flow
□ PATCH /users/settings/password — change password
□ Advertising notification category exists with toggles
□ Campaign status and admin messages cannot be disabled
  (enforced server-side not just frontend)

---

### MODULE 3 — JOBS
Path: apps/api/src/modules/job/

CRUD:
□ POST /jobs — employer only, creates with
  status: pending_review
□ GET /jobs — public, with all 10 filters
□ GET /jobs/:id — public, ParseUUIDPipe on id param
□ PUT /jobs/:id — employer own jobs only
□ DELETE /jobs/:id — soft delete, employer + admin
□ PATCH /jobs/:id/approve — admin only,
  status → active, cache cleared, employer email sent

SEARCH (all 10 filters):
□ keyword — TSVector plainto_tsquery on title + description
□ country — ILIKE filter
□ state — ILIKE filter
□ area — ILIKE filter (3rd level of location)
□ work_mode — ENUM filter
□ employment_type — ENUM filter
□ experience_level — ENUM filter
□ industry — filter
□ salary range — minSalary + maxSalary numeric range
□ date_posted — createdAt >= NOW() - interval

LOCATION SYSTEM:
□ country column on Job entity
□ state column on Job entity
□ area column on Job entity
□ locations.json file exists with Nigeria data
  (36 states + LGAs)
□ Global expansion structure in locations.json

TSVECTOR SEARCH:
□ search_vector column on Job entity
□ Generated ALWAYS AS tsvector column
□ GIN index on search_vector
□ plainto_tsquery used in search (not to_tsquery)

CACHING:
□ Redis cache on GET /jobs — 5 minute TTL
□ Cache immediately invalidated when admin approves job
□ Cache uses SCAN not redis.keys() (no O(n) blocking)

APPLICATIONS:
□ POST /jobs/:id/apply — seeker only
□ Checks resumeUrl exists in SeekerProfile before allowing
□ UNIQUE constraint on (job_id, seeker_id)
□ Duplicate application returns clear error
□ Application status pipeline:
  applied → reviewing → shortlisted → offered | rejected

SAVED JOBS:
□ POST /jobs/:id/save
□ DELETE /jobs/:id/save
□ GET /jobs/saved
□ UNIQUE constraint on (job_id, seeker_id)

REPORTING:
□ POST /jobs/:id/report
□ Creates ReportedJob record

EMPLOYER FEATURES:
□ GET /jobs/my-jobs — own listings only
□ GET /jobs/:id/applications — own jobs only
□ PATCH /jobs/applications/:id — update status

ROUTE ORDERING:
□ Specific routes (my-jobs, saved, seeker/applications)
  registered BEFORE :id parameterised route
□ No route collision issues

ENTITY CHECKS:
□ is_featured boolean on Job entity
□ is_urgent boolean on Job entity
□ featured_until timestamp on Job entity
□ All enum values lowercase with hyphens
  (full-time not FULL_TIME, pending_review not PENDING_REVIEW)
□ view_count field exists and increments on GET /jobs/:id

---

### MODULE 4 — REVIEWS
Path: apps/api/src/modules/review/

COMPANY REVIEWS:
□ GET /reviews/companies — list with search + filter
□ GET /reviews/companies/:name — company detail with
  aggregated ratings
□ POST /reviews — guest (user_id=null) + authenticated
□ All fields validated with DTOs + @MaxLength constraints
□ submitter_hash = SHA-256 of (IP + User-Agent)
  stored internally, never returned in API response
□ Status defaults to pending
□ reCAPTCHA verified server-side
□ Rate limiting: 3 per IP per hour
□ POST /reviews/:id/report
□ PATCH /reviews/:id — admin only (approve/reject)
□ Cache: GET /reviews/companies 10 minute TTL

ANONYMITY CHECK (CRITICAL):
□ display_name (nickname) returned — never real name
□ Real name NEVER returned by any review endpoint
□ Even admin endpoints never return real user name
  in review context
□ submitter_hash never returned in any API response

AGGREGATE RATINGS:
□ Overall star rating calculated correctly
□ Work-life balance rating
□ Pay and benefits rating
□ Management quality rating
□ Company culture rating
□ Would Recommend percentage

SALARY REVIEWS:
□ GET /salaries — requires industry filter
□ Returns avg, min, max per role
□ POST /salaries — fully anonymous
□ user_id is NEVER stored on salary_reviews table
□ No field on salary entity that could link to a user
□ reCAPTCHA verified server-side
□ Rate limiting applied
□ Redis cache: 30 minute TTL on aggregates

---

### MODULE 5 — SHOP / MARKETPLACE
Path: apps/api/src/modules/shop/

SELLER ONBOARDING:
□ POST /shop/seller/apply
□ GET /shop/seller/status
□ Admin approval updates seller_status on SeekerProfile
□ Seller guard checks seller_status === approved
  before allowing product creation
□ Seller guard implemented at database level
  not just frontend

PRODUCT LISTINGS:
□ POST /shop/products — approved sellers only
□ listing_type: digital | physical | service
□ pricing_type: per_unit | request_quote
□ File upload for digital products
□ File stored in Supabase Storage private bucket
□ File key never returned in API response
□ Thumbnail upload
□ GET /shop/products — public with filters
□ GET /shop/products/:id — full detail
□ PUT /shop/products/:id — seller own only
□ DELETE /shop/products/:id — seller own + admin

CART (REDIS-BACKED):
□ Cart stored in Redis with key cart:{userId}
□ NOT stored in memory (no in-memory Map)
□ 24 hour TTL on cart
□ GET /shop/cart
□ POST /shop/cart
□ DELETE /shop/cart/:product_id

PAYMENT FLOW:
□ POST /shop/checkout — creates pending order
□ Order status: pending_payment on creation
□ Flutterwave checkout initiated
□ POST /shop/webhook/flutterwave
□ HMAC-SHA512 signature verified BEFORE processing
□ Invalid signature returns 401
□ Idempotency check — already processed orders skipped
□ On success: commission_amount = total × 0.20
□ On success: seller_earnings = total × 0.80
□ Order status → completed on success
□ Digital: signed download URL generated
□ Physical/Service: seller contact details unlocked
□ Order status NEVER updated from client-side
□ Paystack webhook: POST /shop/webhook/paystack
□ Paystack HMAC verified separately
□ Stripe gateway: stub implemented for future use

PAYMENT ABSTRACTION:
□ PaymentGateway interface exists
□ FlutterwaveGateway implements interface
□ PaystackGateway implements interface
□ StripeGateway stub implements interface
□ Gateway selector function exists
□ All gateways feed into same order processing logic

ESCROW FALLBACK:
□ Original escrow code kept as commented block
□ NOT deleted — kept for reference

DOWNLOADS:
□ GET /shop/orders/:id/download — buyer with paid order
□ Signed URL generated (1 hour expiry)
□ download_count incremented
□ Re-downloadable — new URL each request
□ S3/Supabase key NEVER returned directly

ORDERS TABLE:
□ gateway column exists (flutterwave|paystack|stripe)
□ onDelete: RESTRICT on all order foreign keys
  (buyer, seller, product — financial records protected)
□ Orders can NEVER be deleted
□ All financial data permanently preserved

QUOTE SYSTEM:
□ POST /shop/quotes
□ GET /shop/quotes
□ POST /shop/quotes/:id/respond
□ POST /shop/quotes/:id/accept
□ POST /shop/quotes/:id/reject
□ Quote expires after 7 days (Bull job)

DISPUTES:
□ POST /shop/orders/:id/dispute
□ GET /admin/disputes
□ PATCH /admin/disputes/:id — admin resolves
□ Dispute freezes order, admin decides refund or release

PRODUCT RATINGS:
□ POST /shop/products/:id/rate
□ Verified purchase required
□ UNIQUE constraint (product_id, buyer_id)
□ One rating per buyer per product

CONTACT REVEAL:
□ Seller phone + WhatsApp revealed after purchase
□ Only to the buyer of that specific order
□ contactPhone field on seller profile
□ contactWhatsapp field on seller profile
□ Hidden before purchase — shown only on confirmation

SELLER DASHBOARD:
□ GET /shop/my-sales
□ GET /shop/my-earnings/summary
□ Commission breakdown per order

---

### MODULE 6 — CONNECT / NETWORKING
Path: apps/api/src/modules/connect/

POSTS:
□ POST /connect/posts
□ GET /connect/posts/:id
□ DELETE /connect/posts/:id — own + admin
□ POST /connect/posts/:id/report

FEED:
□ GET /connect/feed — authenticated users
□ Fan-out on write implemented with Bull queue
□ Redis sorted set per user: feed:{userId}
□ Feed TTL: 7 days
□ Falls back to PostgreSQL for posts older than 7 days
□ Pagination implemented

LIKES AND COMMENTS:
□ POST /connect/posts/:id/like
□ DELETE /connect/posts/:id/like
□ likes_count denormalised on Post entity
□ UNIQUE constraint on post_likes (post_id, user_id)
□ GET /connect/posts/:id/comments
□ POST /connect/posts/:id/comments
□ comments_count denormalised on Post entity

FOLLOWS:
□ POST /connect/follow/:userId
□ Auto-accept if follow_approval = auto
□ Pending if follow_approval = manual
□ PATCH /connect/follow/:requestId — accept/reject
□ DELETE /connect/follow/:userId — unfollow
□ GET /connect/followers
□ GET /connect/following
□ UNIQUE constraint on follows (follower_id, followee_id)

MESSAGES:
□ POST /connect/messages/:userId
□ GET /connect/messages/:userId
□ GET /connect/messages — all conversations
□ PATCH /connect/messages/:userId/read
□ Messages indexed on (sender_id, receiver_id)

SAVED POSTS:
□ POST /connect/posts/:id/save
□ DELETE /connect/posts/:id/save
□ GET /connect/posts/saved

NOTIFICATIONS:
□ GET /connect/notifications
□ PATCH /connect/notifications/read-all
□ Notification created on: follow, like, comment, message,
  job approved, order update, review approved

DISCOVER:
□ GET /connect/discover
□ Excludes already followed users
□ Returns sensible suggestions

PROFILES:
□ GET /connect/profiles/:username — public profile
□ Respects profile_visibility setting
□ connections_only: only accessible to followers

USERNAME SYSTEM:
□ @username generated on registration
□ Format: name_slug_XXXX
□ UNIQUE constraint on users table
□ Searchable across Connect

---

### MODULE 7 — ADS / ADVERTISING
Path: apps/api/src/modules/ads/

ENTITIES:
□ AdCampaign entity exists with all fields:
  id, advertiser_id, goal, format, job_id, product_id,
  image_url, destination_url, alt_text, placements,
  target_countries, target_states, target_industries,
  target_roles, target_user_types, starts_at, ends_at,
  daily_budget, total_budget, total_spent, status,
  payment_ref, payment_gateway, rejection_reason,
  notified_50, notified_80, notified_complete
□ AdImpression entity exists
□ AdClick entity exists

ADVERTISER ENDPOINTS:
□ POST /ads/campaigns — create campaign + payment
□ GET /ads/campaigns — own campaigns list
□ GET /ads/campaigns/:id — single campaign
□ GET /ads/campaigns/alerts — dashboard alerts
□ PATCH /ads/campaigns/:id/pause
□ PATCH /ads/campaigns/:id/resume
□ DELETE /ads/campaigns/:id — cancel + refund
□ GET /ads/campaigns/:id/analytics
□ GET /ads/billing
□ POST /ads/campaigns/upload-creative
  (PNG/JPG/WebP, max 2MB, Supabase public bucket)
□ Seekers blocked from creating campaigns
  (checked server-side, not just middleware)

TRACKING ENDPOINTS:
□ GET /ads/active?placement=X — serves to ALL users
  including seekers and guests
□ Applies targeting filters when user is logged in
□ Weighted rotation when multiple campaigns exist
□ Daily budget cap enforced
□ POST /ads/impression — logs impression
□ POST /ads/click/:campaignId — logs click
  + redirects to destination URL

ADMIN ENDPOINTS:
□ GET /admin/ads/queue — pending review campaigns
□ PATCH /admin/ads/:id/approve
□ PATCH /admin/ads/:id/reject with reason
□ GET /admin/ads/all
□ GET /admin/ads/revenue

AD SERVING LOGIC:
□ Only serves active campaigns
□ Checks starts_at <= now <= ends_at
□ Checks total_spent < total_budget
□ Checks daily budget cap (today's spend < daily_budget)
□ Applies audience targeting if user is logged in
□ Returns null (no ad) gracefully if none match

PAYMENT:
□ Full budget charged upfront
□ 20% commission NOT applied (100% platform revenue)
□ Unspent budget refunded on campaign end or rejection
□ Flutterwave + Paystack both supported

NOTIFICATIONS (all 13 triggers):
□ Campaign created + payment confirmed
□ Campaign under review
□ Campaign approved and live
□ Campaign rejected + refund triggered
□ Budget reaches 50%
□ Budget reaches 80%
□ Budget exhausted
□ Campaign paused by user
□ Campaign resumed by user
□ Campaign ended (end date reached)
□ Refund processed
□ Weekly performance summary
□ Admin requests changes

EMAIL TEMPLATES (all 10):
□ AD_CAMPAIGN_CREATED
□ AD_UNDER_REVIEW
□ AD_APPROVED
□ AD_REJECTED
□ AD_BUDGET_50
□ AD_BUDGET_80
□ AD_BUDGET_EXHAUSTED
□ AD_CAMPAIGN_ENDED
□ AD_REFUND_PROCESSED
□ AD_WEEKLY_REPORT

BULL QUEUE JOBS:
□ check-ad-budgets — runs hourly
□ Checks 50% threshold (fires once — notified_50 flag)
□ Checks 80% threshold (fires once — notified_80 flag)
□ Checks budget exhaustion
□ Checks end date expiry
□ Triggers refund on expiry
□ weekly-ad-report — runs Monday 8am WAT (UTC+1)
  Bull cron: '0 7 * * 1'

---

### MODULE 8 — ADMIN
Path: apps/api/src/modules/admin/

USER MANAGEMENT:
□ GET /admin/users — paginated, searchable, filterable
□ PATCH /admin/users/:id — suspend/activate/delete
□ Bulk actions: suspend selected, delete selected

MODERATION QUEUES:
□ GET /admin/queue — all pending items
□ GET /admin/queue/jobs
□ GET /admin/queue/reviews
□ GET /admin/queue/sellers
□ GET /admin/queue/reports
□ GET /admin/disputes — open disputes
□ PATCH /admin/disputes/:id — resolve

CONTENT MODERATION:
□ PATCH /admin/jobs/:id — approve/remove
□ PATCH /admin/reviews/:id — approve/reject
□ PATCH /admin/sellers/:id — approve/reject
□ PATCH /admin/reports/:id — remove/dismiss

REVENUE (SUPER ADMIN):
□ GET /admin/revenue — gross, commissions, payables
□ GET /admin/revenue/transactions
□ GET /admin/analytics/users
□ GET /admin/analytics/jobs
□ GET /admin/analytics/transactions
□ Super admin role guard enforced

LEGAL PAGES:
□ GET /admin/legal — all 12 pages
□ GET /admin/legal/:slug
□ PUT /admin/legal/:slug — WYSIWYG content update
□ updated_by and updated_at logged

EMAIL BROADCAST:
□ POST /admin/email/broadcast
□ Audience segmentation: all | seekers | employers
□ GET /admin/email/history

ADS MANAGEMENT:
□ Admin ads queue integrated
□ Approve/reject with notifications triggered

---

### MODULE 9 — NOTIFICATIONS
Path: apps/api/src/modules/support/ or notifications/

□ NotificationService exists as centralised service
□ createNotification() method with all params
□ All modules call NotificationService (not standalone)
□ GET /notifications — current user's notifications
□ PATCH /notifications/read-all
□ PATCH /notifications/:id/read
□ Unread count included in auth responses
□ In-app notifications stored in notifications table
□ Email notifications sent via SendGrid on each trigger
□ Both channels fire simultaneously on each event

---

## STEP 3 — SECURITY AUDIT

Check every item in this security checklist:

AUTHENTICATION SECURITY:
□ bcrypt 12 rounds — verify in code not assumption
□ JWT secret in environment variable — not hardcoded
□ JWT access token: exactly 15 minutes expiry
□ Refresh token: exactly 7 days expiry
□ httpOnly: true on refresh cookie
□ secure: true on refresh cookie
□ sameSite: strict on refresh cookie — CONSISTENT
  (check login, MFA verify, refresh — all must be strict)
□ Refresh token stored in Redis (not in DB only)
□ Token rotation working (old token invalidated)
□ No token stored in localStorage anywhere in codebase

PAYMENT SECURITY:
□ Flutterwave HMAC-SHA512 verified before processing
□ Paystack HMAC verified before processing
□ crypto.timingSafeEqual used for HMAC comparison
  (prevents timing attacks)
□ Idempotency check on ALL webhook handlers
□ Order status NEVER updated from client request
□ ONLY updated via verified webhook
□ onDelete: RESTRICT on all Order foreign keys
□ No financial records can be deleted

DATA SECURITY:
□ user_id NEVER on salary_reviews table
□ Real name NEVER returned by reviews API
□ submitter_hash never in API response
□ File keys never in API response
□ No PII in logs
□ No secrets in source code
□ All secrets in environment variables
□ SQL injection impossible (TypeORM parameterised)
□ XSS prevention — Helmet.js headers set
□ CORS whitelist — only production frontend origin

INPUT VALIDATION:
□ Global ValidationPipe configured:
  whitelist: true
  forbidNonWhitelisted: true
  transform: true
□ Every endpoint has a DTO
□ All DTOs use class-validator decorators
□ @MaxLength on all text fields
□ ParseUUIDPipe on all :id params
□ File type validation server-side (not just client)
□ File size validation server-side

RATE LIMITING:
□ Global: 100 req/min per IP
□ Auth routes: 5 req/min per IP
□ Review submission: 3 per IP per hour
□ Salary submission: rate limited
□ Rate limiter uses Redis (not in-memory)

INFRASTRUCTURE SECURITY:
□ Helmet.js configured in main.ts
□ CSP header set — no unsafe-eval
□ HSTS header set
□ X-Frame-Options: DENY
□ X-Content-Type-Options: nosniff
□ CORS properly configured
□ No stack traces in error responses
□ Custom exception filter exists
□ No raw TypeORM errors exposed to client

---

## STEP 4 — DATABASE AUDIT

SCHEMA CHECKS:
□ All tables use UUID primary keys
□ All tables have createdAt + updatedAt timestamps
□ All FK relationships have explicit onDelete behaviour
□ No missing indexes on frequently queried columns
□ UNIQUE constraints where required:
  - (job_id, seeker_id) on applications
  - (job_id, seeker_id) on saved_jobs
  - (post_id, user_id) on post_likes
  - (follower_id, followee_id) on follows
  - (product_id, buyer_id) on product_ratings
  - payment_ref on orders (UNIQUE)
  - email on users (UNIQUE)
  - username on users (UNIQUE)
  - slug on legal_pages (UNIQUE)

MIGRATION SYSTEM:
□ synchronize: false in database.module.ts
□ synchronize: false in data-source.ts
□ All migrations in src/database/migrations/
□ pnpm migration:show shows all as [X] (run)
□ No pending migrations
□ Every entity change has a corresponding migration file
□ InitialSchema migration exists and marked as run

NEON CONFIGURATION (if migrated):
□ DATABASE_URL points to Neon pooled connection
□ DATABASE_DIRECT_URL points to Neon direct connection
□ data-source.ts uses DATABASE_DIRECT_URL for CLI
□ ssl: { rejectUnauthorized: false } in TypeORM config
□ Neon Auth is NOT enabled (unnecessary)

---

## STEP 5 — CODE QUALITY AUDIT

TYPESCRIPT:
□ no-explicit-any rule status — is it still ERROR?
□ Current warning count vs baseline of 61
□ No new any types introduced since baseline
□ All TypeORM query results properly typed
□ All service return types explicitly defined

ARCHITECTURE:
□ No business logic in controllers
□ All business logic in services
□ DTOs used for all request bodies
□ Response shapes consistent:
  Success: { success: true, data: {}, meta: {} }
  Error:   { success: false, message: string, errors: [] }
□ No raw database errors exposed
□ Proper NestJS exception types used throughout
  (NotFoundException, ForbiddenException etc.)

MODULE REGISTRATION:
□ All 9 modules registered in app.module.ts
□ All entities registered in their respective modules
□ All repositories injected correctly
□ No circular dependency issues

ENVIRONMENT VARIABLES:
□ All secrets in .env
□ .env never committed to GitHub
□ .env.example exists with all keys documented
□ No hardcoded URLs, keys, or secrets in code
□ NODE_ENV checked where environment-specific
  behaviour differs

BACKGROUND JOBS:
□ Bull module configured in app.module.ts
□ All job processors registered
□ Error handling in all Bull processors
□ Failed jobs handled (not silently swallowed)
□ Bull jobs: fan-out-post, check-ad-budgets,
  weekly-ad-report, quote-expiry-checker,
  auto-release-payment (if applicable)

---

## STEP 6 — KNOWN BUGS TO CHECK

These bugs were previously identified. Verify each one
is actually fixed:

□ JWT access token expiry was 7 days — should be 15min
  CHECK: auth.service.ts expiresIn value
  
□ Cart was in-memory Map — should be Redis
  CHECK: shop.service.ts — no cartStore Map variable
  
□ OTP used Math.random() — should be crypto.randomInt()
  CHECK: token.service.ts — crypto import + randomInt
  
□ unsafe-eval in CSP — should be removed
  CHECK: next.config.ts — no unsafe-eval in script-src
  
□ Logout only cleared localStorage — should call backend
  CHECK: logout calls POST /auth/logout
  
□ reCAPTCHA collected but not verified server-side
  CHECK: auth.service.ts — verifyCaptcha() call exists
  
□ Email verification not checked on login
  CHECK: login() checks isEmailVerified before JWT issued
  
□ Route collision: GET /jobs/employer/me before GET /jobs/:id
  CHECK: controller method order
  
□ Enum mismatch: FULL_TIME vs full-time
  CHECK: all enum values lowercase with hyphens
  
□ onDelete: RESTRICT missing from Order FKs
  CHECK: order.entity.ts — all relations have onDelete
  
□ redis.keys() O(n) operation — should use SCAN
  CHECK: token.service.ts — no .keys() calls
  
□ Stripe gateway: async methods with no await (CI error)
  CHECK: stripe.gateway.ts line 104 + 142
  
□ Homepage redirect to sign-in (middleware bug)
  CHECK: middleware.ts has public routes list
  
□ Axios refresh interceptor infinite loop
  CHECK: isRefreshing flag exists in api.ts

---

## STEP 7 — WHAT TO PRODUCE

After reading every file and checking every item above,
produce a structured audit report in this exact format:

---

# TUTALY BACKEND AUDIT REPORT
Date: [today]
Auditor: Antigravity Senior Engineer

## EXECUTIVE SUMMARY
[2-3 sentences on overall state of the backend]

## CRITICAL ISSUES (must fix before launch)
[List each critical issue with:]
- File path
- Line number if relevant
- What the problem is
- Why it is dangerous
- What the fix is

## HIGH PRIORITY ISSUES (fix this sprint)
[Same format]

## MEDIUM PRIORITY ISSUES (fix before Week 21)
[Same format]

## MISSING FEATURES (not yet built)
[List each feature from the roadmap not yet implemented]
[Group by module]

## WHAT IS CORRECTLY IMPLEMENTED
[List what is working well — be specific]

## DATABASE STATUS
[Migration status, schema health, index coverage]

## SECURITY STATUS
[Overall security posture — what is safe, what is not]

## CODE QUALITY STATUS
[TypeScript warnings count vs baseline, any violations]

## RECOMMENDED ACTION ORDER
[Prioritised list of what to fix/build next]
[Week by week if possible]

---

## IMPORTANT RULES FOR THIS AUDIT

1. READ every file — do not assume or guess
2. CHECK every item on every checklist above
3. REPORT what you find — do not fix anything yet
4. Be SPECIFIC — file paths and line numbers
5. Do not SKIP any module because it looks fine
6. If a file does not exist that should — flag it
7. If a feature is partially built — say so clearly
8. Count the current TypeScript warning total
9. Compare warning count to baseline of 61
10. After the report is complete — WAIT for approval
    before writing any code

This audit is the most important thing you will do
on this project. Do it thoroughly.