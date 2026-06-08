## TUTALY — COMPLETE 24-WEEK DEVELOPMENT ROADMAP

**Start Date:** April 14, 2026
**Launch Date:** Late September 2026

---

## WEEK 1 — April 14–20
### Infrastructure, Monorepo & Database Foundation

**DevOps / Infrastructure:**
- Create GitHub organisation and repository at github.com/tutalyng-cmd/Tutaly
- Set up GitHub Actions CI/CD pipeline — ci.yml that installs pnpm, runs lint, runs build on every push
- Configure branch protection rules on main — no direct pushes, CI must pass before merge
- Set up Supabase project — copy DATABASE_URL to .env
- Set up Upstash Redis — copy REDIS_URL to .env
- Create AWS S3 bucket (or Supabase Storage) — private bucket, configure IAM credentials
- Create SendGrid account — verify sender email tutalyhq@gmail.com, copy API key
- Create Google reCAPTCHA v3 keys — copy site key and secret key
- Set up Sentry project for error monitoring
- Set up UptimeRobot account for uptime monitoring
- Document all environment variables in .env.example with placeholder values and comments

**Backend (NestJS):**
- Initialise pnpm monorepo with pnpm-workspace.yaml
- Create apps/api — NestJS project with TypeScript strict mode
- Scaffold all 9 NestJS modules: auth, user, job, shop, connect, review, support, admin, database
- Each module gets: module.ts, controller.ts, service.ts, dto folder, entities folder
- Configure TypeORM in database.module.ts — connect to Supabase PostgreSQL with SSL
- Set synchronize: false immediately — never enable it again
- Create data-source.ts for TypeORM CLI
- Add migration scripts to package.json: migration:generate, migration:run, migration:revert, migration:show
- Implement all 25+ TypeORM entities:
  - User (id, email, password_hash, role, status, email_verified, date_of_birth, tos_agreed_at, username, full_name, avatar_url)
  - SeekerProfile (user_id FK, headline, bio, skills array, location, cv_url, profile_visibility, follow_approval, seller_status)
  - EmployerProfile (user_id FK, company_name, about, sector, company_size, website_url, logo_url, social_links JSONB, is_verified)
  - Job (id, employer_id FK, title, description, country, state, area, is_remote, work_mode, employment_type, salary_min, salary_max, salary_type, currency, industry, category, role, qualification, experience_level, apply_method, apply_url, deadline, status, is_featured, is_urgent, search_vector tsvector)
  - Application (id, job_id FK, seeker_id FK, status, cover_note, applied_at — UNIQUE job_id+seeker_id)
  - SavedJob (id, job_id FK, seeker_id FK, saved_at — UNIQUE job_id+seeker_id)
  - ReportedJob (id, reporter_id FK, job_id FK, reason, status)
  - CompanyReview (id, company_name, sector, position, department, rating_overall, rating_work_life, rating_pay, rating_management, rating_culture, pros, cons, recommend, display_name, submitter_hash, user_id FK nullable, status)
  - SalaryReview (id, industry, company, role, salary_amount, currency, salary_period, location, submission_year — NO user_id ever)
  - ShopCategory (id, name, slug, icon)
  - ShopSubcategory (id, category_id FK, name, slug)
  - ShopProduct (id, seller_id FK, category_id FK, subcategory_id FK, title, description, listing_type, pricing_type, price, price_unit, min_quantity, price_may_vary, file_s3_key, thumbnail_url, contact_phone, contact_whatsapp, status, is_work_related_confirmed)
  - Order (id, buyer_id FK, product_id FK, seller_id FK, amount_paid, commission_amount, seller_earnings, payment_ref UNIQUE, gateway, status, download_count)
  - QuoteRequest (id, product_id FK, buyer_id FK, seller_id FK, requirements, budget_range, deadline_requested, status, quoted_price, seller_notes, expires_at)
  - OrderDispute (id, order_id FK, raised_by FK, reason, evidence_urls, status, resolved_by FK, resolution_notes, resolved_at)
  - Post (id, author_id FK, content, image_url, likes_count, comments_count)
  - PostLike (post_id FK, user_id FK — UNIQUE)
  - PostComment (id, post_id FK, author_id FK, body)
  - Follow (follower_id FK, followee_id FK, status — UNIQUE follower+followee)
  - Message (id, sender_id FK, receiver_id FK, body, read_at)
  - Report (id, reporter_id FK, target_type, target_id, reason, status)
  - Notification (id, user_id FK, type, message, is_read, link)
  - LegalPage (id, slug UNIQUE, title, content, updated_by FK, updated_at)
  - Ad (id, advertiser_id FK, type, image_url, target_url, placement, starts_at, ends_at, status)
  - NewsletterSend (id, subject, body, audience, sent_by FK, sent_at, recipient_count)
  - SellerApplication (id, user_id FK, bio, category_focus, status, reviewed_by FK)
  - EmailVerification (id, user_id FK, token UNIQUE, expires_at, used_at)
  - PasswordReset (id, user_id FK, token UNIQUE, expires_at, used_at)
  - ProductRating (id, product_id FK, buyer_id FK, rating, comment — UNIQUE product+buyer)
- Generate InitialSchema migration from all entities
- Run migration against Supabase — verify all tables created
- Mark InitialSchema as run in migrations table
- Override outdated packages at root level (glob, inflight)

**Frontend (Next.js):**
- Initialise apps/web — Next.js 14 with App Router, TypeScript strict mode, Tailwind CSS
- Configure Tailwind with brand tokens: navy #0D1B2A, teal #1D9E75
- Set up Inter font from Google Fonts in layout.tsx
- Create route groups: (public), (auth), (dashboard)
- Build sticky top navigation bar — logo, nav links, Sign In + Post a Job buttons, mobile hamburger with slide-out drawer
- Build footer — 4-column link grid, all 12 legal page links, social icons, copyright
- Build Hero section — Navy background, mesh pattern, headline, search bar, dual CTAs

**Design:**
- Set up Figma workspace
- Create design system: colours, typography, spacing, component tokens
- Design navigation bar and footer components

---

## WEEK 2 — April 21–27
### Authentication System & Migration Infrastructure

**Backend:**
- POST /auth/register — seeker and employer roles, age 18+ validation, ToS timestamp logged, bcrypt 12 rounds, sends verification email via SendGrid
- POST /auth/verify-email — token validation, marks email_verified = true, issues JWT tokens
- POST /auth/login — credential validation, checks email_verified, issues access token (15min) + sets httpOnly refresh cookie (7d)
- POST /auth/refresh — validates refresh cookie, issues new access token, rotates refresh token in Redis
- POST /auth/forgot-password — generates reset token, sends SendGrid email, always returns 200 regardless of email existence (no enumeration)
- POST /auth/reset-password — validates token expiry + used status, bcrypt new password, marks token used, invalidates all refresh tokens in Redis
- GET /auth/me — returns current user profile from JWT payload
- PUT /auth/change-password — validates current password, bcrypt new password
- DELETE /auth/account — soft delete, anonymises personal data (name → Deleted User, email hashed), invalidates all sessions
- POST /auth/logout — revokes refresh token in Redis, clears httpOnly cookie
- JWT strategy — RS256 or HS256, payload: user_id, role, email, 15min expiry
- Refresh token strategy — stored in Redis with TTL matching cookie expiry, rotated on every use
- NestJS role guards — @Roles() decorator + RolesGuard for all protected routes
- JWT auth guard — @UseGuards(JwtAuthGuard) on all authenticated endpoints
- Google reCAPTCHA v3 server-side verification in register() — hits Google siteverify API with RECAPTCHA_SECRET_KEY, threshold 0.5
- MFA setup — mandatory for Employer and Admin accounts at database and service level
- Password complexity enforcement — @Matches regex: uppercase + lowercase + digit + special character + minimum 8 characters
- Age validation — date_of_birth must be 18+ at registration date
- Email enumeration prevention — forgot-password returns identical response regardless
- OTP generation using crypto.randomInt() — NOT Math.random()
- Global ValidationPipe with whitelist: true, forbidNonWhitelisted: true, transform: true in main.ts
- Helmet.js security headers in main.ts
- CORS configuration in main.ts — whitelist only Vercel frontend origin
- Rate limiting via @nestjs/throttler — 100 req/min global, 5 req/min on auth routes
- Input sanitisation on all user-generated content before DB write
- Redis-backed session management — TokenService for refresh token operations
- sameSite: strict on all cookie writes consistently

**Frontend:**
- Build Sign In page — email + password with show/hide toggle, Forgot Password link, Sign Up link, loading spinner state, inline error states
- Build Sign Up Step 1 — role selection cards (Job Seeker / Employer) with animated selection state, progress bar
- Build Sign Up Step 2a (Seeker) — Full Name, Email, Password with strength meter, Confirm Password, Date of Birth, Terms checkbox, reCAPTCHA
- Build Sign Up Step 2b (Employer) — Company Name, Full Name, Work Email, Password, Company Size dropdown, Terms checkbox, reCAPTCHA
- Build Sign Up Step 3 — Email Verification screen with envelope illustration, resend with 60-second countdown
- Build Forgot Password page — email input, submit, same-regardless success message
- Build Reset Password page — new password + confirm, strength meter, success redirect to Sign In
- Connect all auth forms to backend API endpoints
- Implement JWT token storage in React Context (NOT localStorage)
- Build Axios authenticated client with response interceptor for 401 auto-refresh
- Build Next.js middleware.ts — checks refresh token cookie, redirects unauthenticated users to /sign-in before dashboard renders

**CI/CD:**
- Resolve all TypeScript lint violations blocking pipeline
- Document warning baseline: apps/api warnings count + apps/web warnings count
- Keep no-explicit-any as strict ERROR — never downgrade
- Add chore/fix-typescript-strict task to task.md for Week 21

---

## WEEK 3 — April 28–May 4
### Jobs Module Backend + Public Pages

**Backend:**
- POST /jobs — create job (Employer only), validates all fields, status defaults to pending_review
- GET /jobs — public search with all 10 filters:
  - keyword (TSVector plainto_tsquery on title + description)
  - country, state, area (ILIKE on each level independently)
  - work_mode (ENUM filter)
  - employment_type (ENUM filter)
  - experience_level (ENUM filter)
  - industry (exact match)
  - salary_min and salary_max (numeric range filter)
  - date_posted (createdAt >= NOW() - interval 'X days')
  - is_featured (boolean filter)
  - Redis cache — 5min TTL, cache key includes all filter params hash
- GET /jobs/:id — job detail with ParseUUIDPipe validation, increments view_count
- PUT /jobs/:id — update job (Employer — own jobs only, status must be pending_review or active)
- DELETE /jobs/:id — soft delete (Employer own + Admin)
- PATCH /jobs/:id/approve — Admin only, status → active, Redis cache invalidated immediately, SendGrid email to employer
- PATCH /jobs/:id/status — Admin updates status (active/removed/expired)
- POST /jobs/:id/apply — Seeker only, checks resumeUrl exists in SeekerProfile, creates application, UNIQUE constraint prevents duplicates
- POST /jobs/:id/save — Seeker, saves to SavedJob table
- DELETE /jobs/:id/save — Seeker, removes SavedJob record
- POST /jobs/:id/report — Any auth, creates ReportedJob record
- GET /jobs/my-jobs — Employer's own listings with applicant counts
- GET /jobs/saved — Seeker's saved jobs
- GET /jobs/seeker/applications — Seeker's applications with full status pipeline
- GET /jobs/:id/applications — Employer's applicants for specific job (own jobs only)
- PATCH /jobs/applications/:id — Employer updates application status
- Route ordering fix — specific routes (my-jobs, saved, seeker/applications) must be registered BEFORE :id parameterized route in NestJS controller
- TSVector setup — raw Supabase SQL migration:
  - ALTER TABLE jobs ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))) STORED
  - CREATE INDEX jobs_search_idx ON jobs USING GIN(search_vector)
- Performance indexes on: employer_id, status, industry, category, country, state, area, is_featured, is_urgent
- locations.json file — Nigeria (36 states + all LGAs and major areas per state) + UK structure for global expansion
- Seeker profile endpoints — GET /users/seeker/profile, PATCH /users/seeker/profile
- CV upload endpoint — POST /users/seeker/resume — PDF only + 5MB max, stored in Supabase Storage private bucket 'resumes', resumeUrl saved to SeekerProfile
- GET /jobs/seeker/applications — all 5 statuses: applied, reviewing, shortlisted, offered, rejected

**Frontend:**
- Build Home Page (SSR/ISR revalidate 300s):
  - Hero section with search bar wired to /jobs?keyword=X&country=Y navigation
  - Platform stats bar with count-up animation on scroll
  - Featured jobs carousel — fetches GET /api/jobs?isFeatured=true&limit=6
  - Browse by Industry grid — 12 tiles, each routes to pre-filtered jobs page
  - Company Reviews snapshot — 3 review excerpt cards
  - Salary Insights teaser — horizontal bar chart + CTA
  - Shop highlights — 3 product cards
  - Join Community CTA banner
- Build Jobs Page (SSR with searchParams):
  - 10-filter sidebar — all filters from spec
  - Cascading location dropdowns from locations.json
  - Job results list with sort bar and pagination
  - Split-panel detail view (LinkedIn style) — click job on left, details appear on right without navigation
  - URL query string sync — all filters reflected in URL, pre-populated on page load
  - "Apply Now" button — auth check: not logged in → /sign-in with return URL, logged in no CV → profile prompt, logged in with CV → submit application
  - All job card states: Featured (gold border), Urgent (red border), Saved (teal bookmark), Applied (green badge), Expired (gray + disabled apply)
- Build Seeker Dashboard:
  - Overview tab — welcome banner, 4 stats cards, recommended jobs, recent applications table
  - Saved Jobs tab
  - My Applications tab — visual pipeline stepper per application showing all 5 statuses
  - Profile tab — bio, skills tag input, headline, location, social links, CV drag-and-drop upload
- Build Employer Dashboard:
  - Overview tab — 4 stats cards, recent applicants table
  - Post a Job tab — multi-section form with all required fields
  - My Jobs tab — cards with status badges, kebab menu with Edit/Boost/Pause/Delete
  - Applicants tab — dropdown to select job, applicants table with CV download and status update
  - Company Profile tab — logo upload, about, sector, website, social links

---

## WEEK 4 — May 5–11
### Reviews, Salary Intelligence & Security Hardening

**Backend:**
- GET /reviews/companies — list all companies with review data, search by name, filter by sector, paginated
- GET /reviews/companies/:name — company profile with:
  - Aggregated overall star rating
  - Breakdown ratings for 4 categories (work-life, pay, management, culture)
  - Would Recommend percentage
  - List of approved reviews sorted by date
  - Redis cache 10min TTL
- POST /reviews — submit company review:
  - user_id added if authenticated, null if guest
  - All required fields validated via CreateReviewDto with @MaxLength constraints on pros, cons, companyName
  - submitter_hash = SHA-256 of (IP address + User-Agent) — stored internally, never exposed
  - Status defaults to pending — goes into admin moderation queue
  - reCAPTCHA v3 server-side verification
- POST /reviews/:id/report — any auth, creates Report record for this review
- PATCH /reviews/:id — Admin only, approve or reject, invalidates company cache on approval
- GET /salaries — aggregated salary data:
  - Required filter: industry
  - Optional: role, location, company
  - Returns: avg, min, max salary per role
  - Count of data points
  - Redis cache 30min TTL
- POST /salaries — submit salary data:
  - NO user_id stored — ever — fully anonymous by design
  - All fields validated
  - reCAPTCHA v3 server-side verification
  - Rate limit: 3 per IP per hour
- Employer company profile expansion:
  - GET /users/employer/profile
  - PATCH /users/employer/profile — company_name, about, sector, company_size, website_url, social_links JSONB
  - POST /users/employer/logo — logo upload to Supabase Storage, signed URL generation
  - PATCH /admin/employers/:id/verify — Admin toggles isVerified on employer profile
- P0 Critical security fixes from audit:
  - JWT access token expiry changed from 7d to 15min
  - OTP generation migrated to crypto.randomInt()
  - In-memory cart Map moved to Redis with cart:{userId} key, 24hr TTL, JSON serialization
  - unsafe-eval removed from CSP in next.config.ts
  - Batch order idempotency check — if (o.status !== OrderStatus.PENDING_PAYMENT) continue inside webhook loop
- P1 High security fixes:
  - Access token storage moved from localStorage to React Context/Zustand in-memory
  - Axios response interceptor — catches 401, calls /auth/refresh, retries original request with new token
  - onDelete: RESTRICT added to all Order foreign keys (buyer, seller, product) — generate migration
  - Logout function calls POST /auth/logout before clearing client state and redirecting
  - Email verification check added to login() — throws UnauthorizedException if !user.isEmailVerified
  - sameSite: strict standardised on all cookie writes (login, MFA verify, refresh)
  - Password complexity regex added to auth.dto.ts
- AuthenticatedRequest interface extracted to apps/api/src/common/types/request.ts — remove duplicates
- Junk files removed from repo — git rm --cached on lint-results.txt, test.html, duplicate lockfiles
- Global exception filter added — prevents raw stack traces from leaking in any environment

**Frontend:**
- Build Company Reviews Page (SSR):
  - Company search with autocomplete suggestions
  - Write a Review button — open to all users including guests
  - Company cards grid — logo/initials, star rating, review count, sector badge
  - Company Detail Page — header with rating breakdown bar chart, would-recommend %, review list
  - Individual review cards — pros (green border) + cons (red border) + recommend badge + report flag
  - Write a Review modal — all fields, rating sliders, CAPTCHA, success state
- Build Salary Reviews Page (SSR):
  - Filter bar — industry (required), role, location, company, Apply Filters button
  - Summary cards row — avg salary, min, max, data points count
  - Horizontal bar chart — min/median/max per role, teal fill, animated on scroll
  - Data table — sortable columns, paginated
  - Submit Salary panel — all fields, full anonymity note, CAPTCHA
  - Empty state for no data

---

## WEEK 5 — May 12–18
### Shop / Marketplace Backend Part 1

**Backend:**
- Seller onboarding flow:
  - POST /shop/seller/apply — creates SellerApplication record, status: pending
  - GET /shop/seller/status — returns current seller application status
  - PATCH /admin/sellers/:id — Admin approves or rejects, updates seller_status on SeekerProfile
  - Approved sellers get email notification via SendGrid
  - Seller guard — NestJS guard checks seller_status === approved before allowing product creation
- Shop category and subcategory setup:
  - Seed all categories from the master document (20+ top-level categories)
  - Seed all subcategories linked to parent categories
  - GET /shop/categories — returns full category tree
- Product/service/digital listing CRUD:
  - POST /shop/products — Approved Seller only, multipart form:
    - listing_type: digital | physical | service
    - pricing_type: per_unit | request_quote
    - If per_unit: price, price_unit, min_quantity required
    - price_may_vary toggle for services
    - For digital: file upload to Supabase Storage private bucket 'products'
    - For Other/Uncategorized: is_work_related_confirmed boolean required
    - thumbnail upload to Supabase Storage
  - GET /shop/products — public listing with filters: category, subcategory, listing_type, pricing_type, search, sort, page
  - GET /shop/products/:id — full product detail with seller info and ratings
  - PUT /shop/products/:id — Seller own product update (cannot change file — create new product)
  - DELETE /shop/products/:id — Seller own / Admin removal, status → removed
- Cart system (Redis-backed):
  - GET /shop/cart — reads cart:{userId} from Redis, returns product details
  - POST /shop/cart — adds item to cart:{userId} Redis list, 24hr TTL refresh on each add
  - DELETE /shop/cart/:product_id — removes specific item from cart
  - Cart validates products still exist and are active on read
- Checkout initiation:
  - POST /shop/checkout — validates cart, creates pending Order records for each item, initialises Flutterwave payment, returns Flutterwave payment link/data
  - Order status: pending_payment on creation
  - Order stores: buyer_id, product_id, seller_id, amount_paid, commission_amount (20%), seller_earnings (80%), gateway: flutterwave
- Flutterwave webhook:
  - POST /shop/webhook/flutterwave — receives webhook
  - Verifies Flutterwave-Signature HMAC-SHA512 against secret key — returns 401 if invalid
  - Idempotency check — if order already completed, return 200 without reprocessing
  - If valid and pending_payment:
    - Order status → completed
    - commission_amount = amount_paid × 0.20 recorded
    - seller_earnings = amount_paid × 0.80 recorded
    - For digital: signed download URL generated, buyer notified via email
    - For physical/service: seller contact details unlocked for buyer
    - Seller notified via SendGrid email
- Paystack webhook:
  - POST /shop/webhook/paystack — identical flow with Paystack HMAC-SHA512 verification
  - gateway field on Order set to paystack
- Payment abstraction layer:
  - PaymentGateway interface: initiatePayment(), verifyWebhook(), processRefund()
  - FlutterwaveGateway implements PaymentGateway
  - PaystackGateway implements PaymentGateway
  - StripeGateway stub implements PaymentGateway (for future global)
  - Gateway selector function: Nigeria default → Flutterwave, user choice → Paystack, international → Stripe
- Digital product downloads:
  - GET /shop/orders/:id/download — Buyer with paid order only
  - Generates signed Supabase Storage URL (1hr expiry)
  - Increments download_count on Order
  - Re-downloadable unlimited times — new signed URL each request
- My purchases:
  - GET /shop/my-purchases — all completed orders for buyer with download access or contact details
- Seller sales:
  - GET /shop/my-sales — seller's completed orders with commission breakdown, total earnings
- Old escrow code — kept as commented block in shop.service.ts with clear comment: ESCROW FALLBACK — DO NOT DELETE

**Frontend:**
- Build Shop Homepage (SSR):
  - Navy gradient header with search bar
  - Category navigation tabs — horizontal scroll, sticky on scroll
  - Product grid — 3 columns, all card variants (digital/physical/service badges)
  - Advertising banner placements (top + sidebars — placeholder for now)
- Build Product Detail Page:
  - 2-column layout — media + tabs left, purchase panel right
  - Seller mini-card with verified badge
  - Price display (fixed) or Request Quote button
  - Add to Cart + Buy Now buttons
  - Tabs: Description | Reviews | Seller Info | Delivery and Returns
  - Security payment note
- Build Cart Sidebar:
  - Slide-out from right
  - Item list with thumbnail, title, price, remove button
  - Subtotal + Proceed to Checkout button
- Build Checkout Page:
  - Order summary right panel
  - Billing details form: Full Name, Email, Phone
  - Flutterwave/Paystack payment widget
  - Place Order button

---

## WEEK 6 — June 2–8
### Shop Backend Part 2 — Quotes, Disputes & Seller Dashboard

**Backend:**
- Request-a-Quote flow:
  - POST /shop/quotes — Buyer submits quote request: product_id, requirements, budget_range (optional), deadline (optional)
  - QuoteRequest created with status: pending, expires_at = 7 days from creation
  - Seller notified via SendGrid
  - GET /shop/quotes — returns buyer's sent requests or seller's received requests depending on role
  - GET /shop/quotes/:id — single quote detail
  - POST /shop/quotes/:id/respond — Seller responds with quoted_price + seller_notes, status → quoted, buyer notified
  - POST /shop/quotes/:id/accept — Buyer accepts, status → accepted, checkout link generated, redirects to checkout
  - POST /shop/quotes/:id/reject — Buyer rejects, status → rejected, seller notified
  - Bull job: quote expiry checker — runs daily, marks stale quotes as expired, notifies both parties
- Order dispute flow:
  - POST /shop/orders/:id/dispute — Buyer raises dispute within 48hrs of order completion
  - Creates OrderDispute record, status: open
  - Order flagged for admin review
  - Seller notified
  - GET /admin/disputes — Admin views all open disputes
  - PATCH /admin/disputes/:id — Admin resolves:
    - decision: refund → Paystack/Flutterwave refund initiated, order status → refunded, buyer notified
    - decision: release → seller earnings confirmed, order status → resolved, seller notified
    - resolution_notes saved, resolved_by saved
- Product ratings system:
  - POST /shop/products/:id/rate — Buyer only, verified purchase required (must have completed order), 1-5 stars + optional comment
  - One rating per buyer per product — UNIQUE constraint
  - ProductRating entity
  - Aggregate rating recalculated on product after each new rating
- Seller earnings dashboard:
  - GET /shop/my-sales — paginated list of completed orders with:
    - Product title, buyer (anonymous username), amount, commission deducted, seller earnings, date
  - GET /shop/my-earnings/summary — total gross sales, total commission paid, total net earnings, pending amount
- Commission tracking:
  - All commission data stored per order
  - Super Admin revenue endpoints aggregate across all orders
- Physical product contact reveal:
  - After order completed, GET /shop/orders/:id/contact returns seller phone + WhatsApp
  - Only accessible by buyer of that specific order
  - Seller must have contactPhone set on their profile or the specific listing

**Frontend:**
- Build Order Confirmation Page:
  - Success illustration + Order reference
  - For digital: Download button + "Go to My Purchases" link
  - For physical/service: Seller contact card revealed (phone + WhatsApp click-to-call/message)
- Build My Purchases Page:
  - Table: Product | Date | Amount | Action
  - Digital: Download button (re-downloadable)
  - Physical/Service: View Seller Contact button
  - Rate Product button (post-purchase)
- Build Seller Dashboard:
  - My Listings tab — active listings with edit, pause, delete
  - Add Listing form — all listing types, pricing types, file upload for digital
  - Orders tab — pending and completed orders, mark delivered button
  - Earnings tab — summary cards + transaction table with commission breakdown
- Build Quote Request UI:
  - Request Quote form on product detail page (replaces Add to Cart for quote-type listings)
  - Quote management page — buyer sees sent quotes + seller responses
  - Accept/Reject quote UI
- Build Dispute UI:
  - Report Issue button on order confirmation and my purchases
  - Dispute form — reason + optional evidence upload
  - Dispute status tracker

---

## WEEK 7 — June 9–15
### Marketplace Backend Part 3 — Physical Products & Advanced Features

**Backend:**
- Physical order status tracking:
  - Order status flow for physical goods: pending_payment → completed → delivered → confirmed
  - PATCH /shop/orders/:id/delivered — Seller marks order as delivered (physical only)
  - PATCH /shop/orders/:id/confirm — Buyer confirms receipt (physical only)
  - Buyer notified when seller marks delivered
  - 48hr window starts after seller marks delivered — Bull cron job monitors and auto-confirms if no buyer response
- Bulk order support:
  - Minimum quantity enforcement on checkout — validates quantity >= min_quantity before creating order
  - Quantity field on cart items for per-unit listings
- Seller profile phone number:
  - contactPhone and contactWhatsapp fields added to SeekerProfile entity
  - Migration generated and run
  - These fields populate onto physical and service listing detail pages
  - Shown to buyer only after purchase — hidden behind payment wall before
- Work-related listing enforcement:
  - Admin moderation flag for listings in Other/Uncategorized category
  - is_work_related_confirmed must be true for these listings to be approved
  - Admin can remove non-compliant listings
- Seller subscription model (infrastructure):
  - seller_plan field on SeekerProfile: free | basic | premium
  - featured_until timestamp on ShopProduct
  - PATCH /shop/products/:id/feature — Seller pays to feature listing, sets featured_until
  - Featured listings appear at top of category results
- Product quick-view:
  - GET /shop/products/:id/preview — returns thumbnail, title, price, rating, seller name for modal preview
- Shop search performance:
  - Full-text search on product title and description using TSVector (same pattern as jobs)
  - Index on category_id, subcategory_id, listing_type, pricing_type, status, seller_id
  - Redis cache on GET /shop/products (5min TTL)

**Frontend:**
- Build Seller Application Form:
  - "Become a Seller" page — bio, category focus, sample work description, submit
  - Application status page — shows pending/approved/rejected with messaging
- Build Physical Order Tracking UI:
  - Order status stepper: Paid → Processing → Dispatched → Delivered → Confirmed
  - Seller "Mark as Delivered" button in orders dashboard
  - Buyer "Confirm Receipt" button in my purchases
- Build Product Quick-View Modal:
  - Hover on product card shows quick-view button
  - Modal: thumbnail, title, price, rating, seller, Add to Cart + View Full Listing buttons
- Build Featured Listings Display:
  - "Featured" badge on boosted products
  - Featured products appear at top of results with gold border accent

---

## WEEK 8 — June 16–22
### Connect / Networking Backend

**Backend:**
- Posts CRUD:
  - POST /connect/posts — creates post (text + optional image upload to Supabase Storage), any authenticated user
  - GET /connect/posts/:id — single post with comments
  - DELETE /connect/posts/:id — own post or Admin
  - POST /connect/posts/:id/report — any auth, creates Report record
- Feed system (fan-out on write):
  - After POST /connect/posts:
    - Bull job queued: fan-out-post with post_id + author_id
    - Worker fetches all followers with status: accepted from follows table
    - For each follower: ZADD their feed:{userId} sorted set in Redis, scored by timestamp, value = post_id
    - Feed TTL: 7 days per sorted set
  - GET /connect/feed — authenticated seeker or employer:
    - Reads feed:{userId} Redis sorted set (ZREVRANGE with pagination)
    - Fetches post details from PostgreSQL by post IDs
    - Falls back to direct PostgreSQL query for posts older than 7 days
- Likes and comments:
  - POST /connect/posts/:id/like — creates PostLike, increments likes_count (denormalised), notifies post author
  - DELETE /connect/posts/:id/like — removes PostLike, decrements likes_count
  - GET /connect/posts/:id/comments — paginated comments list
  - POST /connect/posts/:id/comments — creates PostComment, increments comments_count, notifies post author
  - DELETE /connect/posts/:id/comments/:commentId — own comment or Admin
- Follow system:
  - POST /connect/follow/:userId — creates Follow record:
    - If target user has follow_approval: auto → status: accepted immediately
    - If target user has follow_approval: manual → status: pending, target notified
  - PATCH /connect/follow/:requestId — target user accepts or rejects pending follow request
  - DELETE /connect/follow/:userId — unfollow, removes Follow record
  - GET /connect/followers — current user's accepted followers + pending requests
  - GET /connect/following — users current user is following (accepted only)
- Direct messages:
  - POST /connect/messages/:userId — creates Message record, receiver notified
  - GET /connect/messages/:userId — conversation thread between current user and userId, sorted by createdAt
  - PATCH /connect/messages/:userId/read — marks all messages from userId as read (sets read_at)
  - GET /connect/messages — list of all conversations (most recent message per thread)
- Discover people:
  - GET /connect/discover — suggested users to follow:
    - Excludes already followed users
    - Prioritises: same industry, same location, mutual connections
    - Returns 10 suggestions
- Post sharing:
  - Share to Feed — creates repost record linking to original post
  - Copy Link — returns canonical URL for the post
  - Share via WhatsApp — returns WhatsApp share URL: https://wa.me/?text=URL
  - Share via Twitter — returns Twitter share URL
- Saved posts:
  - POST /connect/posts/:id/save — saves post for current user
  - DELETE /connect/posts/:id/save — removes saved post
  - GET /connect/posts/saved — list of user's saved posts
- User profiles:
  - GET /connect/profiles/:username — public profile by @username
  - Returns: avatar, name, username, bio, posts count, followers count, following count, recent posts
- @username system:
  - Generated on registration: name_slug_XXXX (4 random digits)
  - UNIQUE constraint in users table
  - Searchable and linkable across Connect module

---

## WEEK 9 — June 23–29
### Admin Dashboard Backend Part 1

**Backend:**
- User management:
  - GET /admin/users — paginated, searchable, filterable by role and status
  - GET /admin/users/:id — full user profile with all associated data
  - PATCH /admin/users/:id — update status: active | suspended | deleted
  - Suspended users: cannot login, receive suspension email
  - Deleted users: soft delete, data anonymised
  - Bulk actions: POST /admin/users/bulk — suspend or delete multiple users
- Jobs moderation queue:
  - GET /admin/queue/jobs — all pending_review jobs with employer details
  - PATCH /admin/jobs/:id — approve (status → active + cache clear + employer email) or remove
  - GET /admin/jobs — all jobs with full filter (status, employer, date)
- Reviews moderation queue:
  - GET /admin/queue/reviews — all pending reviews with full content
  - PATCH /admin/reviews/:id — approve (publish) or reject
  - Edit capability: Admin can edit review text before approving
  - GET /admin/reviews — all reviews with status filter
- Sellers queue:
  - GET /admin/queue/sellers — pending seller applications
  - PATCH /admin/sellers/:id — approve or reject with optional reason
  - Approval: seller_status → approved on SeekerProfile, email notification sent
  - Rejection: rejection email with reason sent
- Reported content queue:
  - GET /admin/queue/reports — all unresolved reports (posts, jobs, reviews, users)
  - PATCH /admin/reports/:id — resolve: remove content | dismiss report
  - Removing content: soft deletes the target item
  - Bulk dismiss: mark multiple reports as dismissed
- Dispute resolution queue:
  - GET /admin/disputes — all open disputes with order and user details
  - PATCH /admin/disputes/:id — resolve with refund or release decision
  - Resolution triggers appropriate payment action
- Platform-wide notifications service:
  - NotificationService — centralized service called by all other modules
  - createNotification(userId, type, message, link) — creates Notification record
  - Event triggers:
    - Follow request received
    - Follow request accepted
    - Post liked
    - Post commented
    - Job application status changed
    - Job approved by admin
    - Order completed
    - Order disputed
    - Review approved
    - Seller application approved/rejected
    - New message received
  - GET /notifications — current user's notifications, sorted by date, paginated
  - PATCH /notifications/read-all — marks all as read
  - PATCH /notifications/:id/read — marks single notification as read
  - Unread count included in GET /auth/me response

---

## WEEK 10 — June 30–July 6
### Admin Dashboard Backend Part 2 — Revenue, Ads & Content Management

**Backend:**
- Revenue dashboard (Super Admin only):
  - GET /admin/revenue — gross revenue total, total commission earned, total seller payables, breakdown by gateway (Flutterwave vs Paystack vs Stripe)
  - GET /admin/revenue/transactions — paginated transaction table: Order ID, buyer username, product title, amount, commission, seller earnings, gateway, date, status
  - GET /admin/revenue/summary — monthly/weekly breakdown charts data
  - Revenue reconciliation: matches platform records against Flutterwave and Paystack transaction logs
- Analytics dashboard (Super Admin only):
  - GET /admin/analytics/users — user growth over time: total registrations by date, seekers vs employers breakdown, retention metrics
  - GET /admin/analytics/jobs — job stats: total posted, total applications, avg applications per job, top industries
  - GET /admin/analytics/transactions — transaction volume over time, avg order value, top selling products, top sellers
  - GET /admin/analytics/reviews — review submission rate, approval rate, top reviewed companies
- Advertising system:
  - GET /admin/ads — all ads with status filter: active | paused | expired
  - POST /admin/ads — create ad: type (banner | featured_job | sponsored), image_url, target_url, placement, starts_at, ends_at
  - PATCH /admin/ads/:id — update ad status or details
  - DELETE /admin/ads/:id — remove ad
  - GET /ads/active — public endpoint returning currently active ads by placement (for frontend rendering)
  - Ad placements: homepage_top | homepage_sidebar | jobs_sidebar | shop_top | connect_sidebar
  - Auto-expiry: Bull cron job checks ends_at daily, sets status → expired
- Commission management (Super Admin):
  - PATCH /admin/commission/rate — update platform commission rate (currently fixed at 20%)
  - GET /admin/commission/summary — total earned, per category breakdown, per seller breakdown
- Newsletter and email broadcast:
  - POST /admin/email/broadcast — sends via SendGrid to all users, seekers only, or employers only
  - Body: subject, rich text content, audience selection
  - Audience segmentation — queries users by role from database
  - Stores send record in NewsletterSend table with recipient_count
  - GET /admin/email/history — all previous broadcasts with open rate (if SendGrid tracking enabled)
- Email list management:
  - GET /admin/email/subscribers — all subscribed users with role and join date
  - PATCH /admin/email/subscribers/:id — unsubscribe user manually
  - Users can unsubscribe themselves via settings
- Legal pages CRUD:
  - GET /admin/legal — list all 12 legal pages with titles and last-updated dates
  - GET /admin/legal/:slug — get single page content
  - PUT /admin/legal/:slug — update content via WYSIWYG rich text editor, logs updated_by (admin user id) and updated_at timestamp
  - All 12 pages: terms-of-service, privacy-policy, disclaimer, community-guidelines, review-policy, marketplace-policy, refund-policy, advertiser-policy, employer-policy, cookie-policy, about-us, contact-us
- Platform announcements:
  - POST /admin/announcements — creates announcement that appears in Connect right sidebar and notification center
  - GET /announcements/active — public endpoint for frontend to fetch current announcements
- Cookie consent:
  - GET /admin/cookies/settings — returns current cookie policy settings
  - PATCH /admin/cookies/settings — admin updates cookie categories and descriptions

---

## WEEK 11 — July 7–13
### Settings Backend & User Account Management

**Backend:**
- Account settings:
  - PUT /users/settings/email — change email: validates current password, sends verification to new email, updates only after verification
  - PUT /users/settings/password — change password: validates current password, bcrypt new password, invalidates all other sessions
  - DELETE /users/account — account deletion: requires password confirmation, soft deletes, anonymises all personal data (name → Deleted User, email → hashed, avatar removed), invalidates all sessions, seller listings removed, active jobs removed
- Notification settings:
  - GET /users/settings/notifications — returns current notification preferences
  - PATCH /users/settings/notifications — update per-category toggles:
    - New jobs matching profile
    - Job application status changed
    - Review approved
    - New follower
    - Follow request
    - New message
    - Post liked
    - Post commented
    - Order updates
    - Platform announcements
- Privacy settings:
  - GET /users/settings/privacy — returns current privacy settings
  - PATCH /users/settings/privacy:
    - profile_visibility: public | connections_only
    - follow_approval: auto | manual
    - show_in_discover: boolean
    - show_salary_on_profile: boolean
- Cookie settings:
  - GET /users/settings/cookies — returns user's cookie consent choices
  - PATCH /users/settings/cookies — updates consent: analytics_cookies, marketing_cookies, functional_cookies
- Profile visibility enforcement:
  - GET /connect/profiles/:username — checks profile_visibility setting:
    - public: visible to everyone
    - connections_only: only visible to accepted followers
  - GET /connect/discover — respects show_in_discover = false, excludes these users

---

## WEEK 12 — July 14–20
### Frontend Part 1 — Public Pages

**Frontend:**
- All public pages must use Next.js SSR or SSG with proper meta tags for SEO
- Dynamic meta tags on every SSR page:
  - og:title, og:description, og:image, canonical URL, twitter:card
  - Jobs: og:title = job title + company name, og:description = first 150 chars of description
  - Companies: og:title = company name + avg rating
  - Products: og:title = product title + price
- Auto-generated sitemap.xml:
  - All active jobs
  - All company review pages
  - All shop products
  - All legal pages
  - Static routes
  - Submit to Google Search Console
- robots.txt — Disallow: /admin/, /api/, /dashboard/ | Allow: all public pages
- Build Home Page (final production version):
  - All 10 zones fully designed and connected to real API data
  - Advertising banner zone at top (renders active ads from /ads/active)
  - Count-up animation on stats bar
  - Featured jobs carousel with real data
  - Industry grid with job counts per industry
  - Reviews snapshot with real approved reviews
  - Salary teaser with real aggregated data
  - Shop highlights with real products
- Build Jobs Page (final production version):
  - Full SSR with all 10 filters in URL params
  - Pre-populated filters from URL on page load
  - Hero search wired correctly
  - All card states (featured, urgent, saved, applied, expired)
  - Infinite scroll on mobile
- Build Company Reviews Page (final):
  - SSR company list
  - Company Detail pages as dynamic SSR routes
  - Write a Review modal with full form
  - Report review functionality
- Build Salary Reviews Page (final):
  - SSR with filter params in URL
  - Interactive chart with real data
  - Submit salary modal with CAPTCHA
  - Empty state with submission CTA
- Build Legal Pages (×12):
  - Consistent template: Logo + title + last updated + table of contents + body + footer
  - All pages editable via admin WYSIWYG editor
  - All accessible from footer links
  - All linked to each other in footer
- Build Free Job Posting Landing Page:
  - Marketing copy explaining free tier
  - Feature comparison table: Free vs Premium
  - Inline quick-post form
  - CTA: Create Employer Account for Full Features
- Build Join Community Page:
  - Marketing page for Connect module
  - Platform stats, member testimonials (placeholder), sign up CTA
- Advertising display:
  - Banner ad component — renders image + links to target_url
  - Placed at: homepage top, jobs page sidebar, shop page top
  - Only renders if active ads exist for that placement

---

## WEEK 13 — July 21–27
### Frontend Part 2 — Auth Pages & Onboarding

**Frontend:**
- Build Sign In Page (final):
  - Connected to POST /auth/login
  - Inline field-level error states
  - Loading spinner on submit
  - Return URL handling — after login redirects back to attempted page
  - Remember me (optional — extends session awareness)
- Build Sign Up Flow (final):
  - Step 1: Role selection (Seeker / Employer) with animated card selection
  - Step 2a: Seeker registration form — all fields, password strength meter, 18+ DOB validation, Terms checkbox with timestamp, reCAPTCHA
  - Step 2b: Employer registration form — company fields, size dropdown, Terms checkbox, reCAPTCHA
  - Step 3: Email verification screen with 60-second resend cooldown
  - All connected to POST /auth/register
  - Progress bar showing current step
- Build Forgot Password Page:
  - Email input + submit
  - Always shows same success message regardless of email existence
- Build Reset Password Page:
  - Token validated on page load — redirect to Sign In if invalid/expired
  - New password + confirm password + strength meter
  - Connected to POST /auth/reset-password
  - Success → redirect to Sign In with "Password updated" toast
- Build Email Verification Success Page:
  - Shown after clicking verification link
  - "Email verified! Your account is now active." illustration
  - Redirect to dashboard button
- Cookie Consent Banner:
  - Appears on first visit, bottom of screen
  - "Accept All" + "Manage Preferences" + "Reject Non-Essential" buttons
  - Preferences modal: toggles for analytics, marketing, functional cookies
  - Choice saved to localStorage + POST /users/settings/cookies if authenticated
  - Banner dismissed once choice made, never shown again
- Role-based redirect after login:
  - Seeker → /dashboard/seeker
  - Employer → /dashboard/employer
  - Admin → /dashboard/admin
  - Super Admin → /dashboard/admin (with revenue tabs visible)

---

## WEEK 14 — July 28–August 3
### Frontend Part 3 — Seeker Dashboard

**Frontend:**
- Build Seeker Dashboard Layout:
  - Left sidebar with avatar, @username, profile completeness bar, all nav items
  - Top bar with greeting, notification bell (unread count badge), avatar dropdown
  - Mobile: bottom tab bar with 5 icons replacing sidebar
- Build Overview Tab:
  - Welcome banner with personalised greeting
  - 4 stats cards: Applications Submitted, Saved Jobs, Profile Views, Response Rate
  - Recommended Jobs section (3 job cards based on skills/industry)
  - Recent Applications table with status badges
- Build My Applications Tab:
  - All applications with visual pipeline stepper per application
  - All 5 status values shown: Applied, Reviewing, Shortlisted, Offered, Rejected
  - Filter tabs: All | Applied | Reviewing | Shortlisted | Offered | Rejected
  - Application card shows job title, company, applied date, current status
  - Expand card to see full pipeline stepper
- Build Saved Jobs Tab:
  - Grid of saved job cards
  - Remove from saved button
  - Direct apply button
  - Empty state with "Browse Jobs" CTA
- Build Profile Tab:
  - Profile photo upload (circular, with edit overlay on hover)
  - Full name, headline, bio textarea
  - Skills tag input — type skill, press Enter, creates removable chip
  - Location fields (country, state, area cascading dropdow
