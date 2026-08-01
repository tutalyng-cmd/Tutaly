# 12 — Master Prompt: Ads Dashboard, Admin Panel & Full-Platform QA
**For: Antigravity** | **Owner: Edudje Wisdom** | **Status: Ready to build**

> Read this in full before starting. This covers three things in order: (1) a full QA pass on everything already built, (2) the Ads Dashboard, (3) the Admin Panel. Do them in this order — testing what exists first will surface patterns you need to avoid repeating in the two new builds. Read `10-master-prompt.md`, `11-community-feature-spec.md`, and `AGENTS.md` before starting; this document doesn't repeat rules already established there.

---

## Part 1 — Full-Platform QA Pass

Before building anything new, audit everything that already exists. Go page by page — every seeker page, employer page, seller page, shop flow, connect/community page, auth page, and public marketing page. For each one, check every item below and fix what fails. Do not skip pages because they "look done" — several already-shipped pages have looked correct in a screenshot while being functionally broken underneath.

### 1.1 Known failure patterns — check for these specifically

These are real bugs caught in this codebase already, more than once in some cases. Check every page against every item on this list, not just the pages where they were originally found.

```
□ Malformed/duplicate <style> tags. If any page has two opening <style> tags
  with only one closing tag (or vice versa), the browser will render CSS as
  literal visible text instead of applying it. Grep every page's source for
  "<style>" and "</style>" — the counts must match, and there must be exactly
  one of each per page.

□ Unstyled component defaults leaking through. Check every card, button, and
  input for a light/white background on a page that should be dark-themed.
  This happens when a component library's default styling isn't overridden
  by the actual design tokens. If you see white anywhere on a dark page,
  that's this bug.

□ Stuck loading states. Any element that shows "Loading..." needs to be
  checked for whether it actually resolves after data fetches, or whether
  it's permanently stuck due to a broken data binding. Reload every page and
  wait 3 full seconds before evaluating — if placeholder text is still
  showing, that's a real bug, not a timing issue.

□ Wrong/fake brand assets. Confirm every logo instance uses the actual PNG
  logo asset (colored bars + wordmark), never plain text standing in for it.
  Search the codebase for anywhere the logo might be hardcoded as text.

□ Contrast violations. Any text sitting at reduced opacity or using a muted
  token (--c-400, --c-500) where it should use a high-contrast token
  (--c-100, --c-200) will look "washed out" next to full-contrast elements
  on the same card. If a heading looks dimmer than the button next to it,
  that's this bug — check the actual token being used, not just how it looks.

□ Off-brand button colors. Primary actions are blue (var(--blue)). Green is
  reserved for success/positive states only. Gold is reserved for premium/
  achievement only. If any primary CTA button is green or gold, it's wrong
  regardless of how it looks — fix the token reference.

□ Dead interactive elements. Every button, icon, and "..." menu must have a
  real handler wired to a real action or a real API call. A button that
  looks real but does nothing (or opens a native browser alert() instead of
  a proper toast/banner per 09-feedback-system.md) is not acceptable. Click
  every clickable element on every page and confirm something real happens.

□ Nav/content stacking bugs. On every page, confirm the page title and body
  content render fully below the fixed top nav, never overlapping or
  rendering through it. Check specifically after any layout or CSS change.

□ Contradictory empty/populated states rendering simultaneously. If a page
  can show "no posts yet" and real posts and "you're all caught up" at the
  same time, the empty-state logic isn't actually checking for the presence
  of real content before deciding what to render.

□ Test/seed data visible in production-facing UI. Search every list of
  users, companies, or content for anything that looks like seed data
  (names like "testlock_...", placeholder emails, obviously fake entries).
  If found, these need a real isTestAccount flag filtering them out — not a
  fragile string-pattern match on email or name.

□ Truncation without a way to see the full value. Any name, title, or label
  that can be arbitrarily long needs CSS truncation (ellipsis) AND a way to
  see the full text (title attribute at minimum, a tooltip if the design
  system has one).

□ Claims of "this already works" without proof. Do not report anything as
  fixed, tested, or working based on reading the code and reasoning about
  what it should do. Every fix needs to be verified by actually running it —
  screenshot the real rendered state, or show the actual network request/
  response, or show the actual database row. A description of intended
  behavior is not verification.
```

### 1.2 Systematic breakpoint and interaction testing

For every page in the app:

```
□ Load at 320px, 375px, 768px, 1440px. Zero horizontal overflow at any of
  them — check via document.documentElement.scrollWidth vs clientWidth,
  not just a visual glance, since visual overflow can be masked by
  overflow-x:hidden while still indicating a real underlying layout bug
  worth investigating.
□ Every form on the page: submit with empty required fields (should show
  validation errors, not silently fail or silently succeed), submit with
  valid data (should actually persist and give real feedback), check the
  loading state while submitting (button should disable/show a spinner,
  never allow a double-submit).
□ Every list/feed: check loading, empty, error, and populated states all
  render distinctly and correctly, per 09-feedback-system.md.
□ Every image, avatar, and icon renders — no broken image icons, no missing
  alt text on meaningful images.
□ Tab through the page with keyboard only — every interactive element must
  be reachable and show a visible focus state.
```

### 1.3 Data and backend spot-checks

```
□ Confirm no endpoint returns an unbounded list — every list endpoint must
  be paginated (cursor or offset, matching the pattern already used
  elsewhere in the codebase).
□ Confirm rate limits from 11-community-feature-spec.md Section 8 are
  actually enforced, not just documented — hit an endpoint past its limit
  and confirm you get a 429.
□ Spot-check that soft-delete is used consistently (deleted_at pattern) —
  search for any raw DELETE FROM on user-generated content tables.
```

**Deliverable for Part 1:** a written list of every bug found, each one tagged with which page/component it's in, and confirmation of the fix for each — with actual proof (screenshot, network log, or database query result), not a description.

---

## Part 2 — Ads Dashboard

Per `AGENTS.md`: employers can create ad campaigns; seekers cannot create them but do see them; admin must review and approve every campaign before it goes live. Build the employer-facing dashboard for this.

### 2.1 Pages needed

| Page | Purpose |
|---|---|
| `/advertise` | Landing/overview — active campaigns, performance summary, "Create Campaign" CTA |
| `/advertise/create` | Campaign creation flow |
| `/advertise/:id` | Single campaign detail — performance metrics, edit, pause/resume |
| `/advertise/billing` | Ad spend billing history, payment method |

### 2.2 Campaign creation flow

Multi-step, matching the visual pattern already established for multi-step forms (checkout's numbered steps in `shop/checkout.html`):

```
Step 1 — Objective: what is this campaign for?
  Options: "Promote a job post", "Promote your company profile",
  "Promote a marketplace listing"
  (This determines what gets linked/promoted — validate the selected
  objective actually has a valid target, e.g. don't let someone promote a
  job post they don't have any active listings for.)

Step 2 — Targeting
  Location (reuse the existing 3-level location system — country/state/area)
  Industry / role category
  Audience: seekers only, employers only, or both — confirm against the
  AGENTS.md rule that all users (including guests) can SEE ads regardless
  of targeting; targeting controls who's shown the ad, not who's blocked
  from the platform.

Step 3 — Creative
  Headline (max 80 chars, with live character count)
  Body text (max 200 chars, with live character count)
  Image upload — reuse the exact same presigned-URL + EXIF-strip pipeline
  from 11-community-feature-spec.md Section 5. Do not build a second upload
  path for this.
  Live preview of how the ad will render in-feed as the user fills these in.

Step 4 — Budget & Schedule
  Total budget (₦, minimum enforced — confirm the minimum with Edudje
  before hardcoding a number, this is a business decision not a technical
  one)
  Start date / end date, or "run until budget is spent"
  Estimated reach shown based on targeting + budget (can be a simple
  formula, doesn't need to be sophisticated for launch)

Step 5 — Review & Submit
  Full summary of everything above
  Clear statement that the campaign enters PENDING_REVIEW and won't go live
  until admin approves — this needs to be explicit and visible, not a
  surprise after submit
  "Submit for Review" button
```

### 2.3 Campaign statuses & states

```
draft → pending_review → active → paused → completed
                       ↘ rejected
```

- `draft`: saved but not submitted, editable freely
- `pending_review`: submitted, awaiting admin decision, not editable (or editable but resets to pending_review on any change — decide and be consistent)
- `active`: approved and running
- `paused`: employer-initiated pause, can resume
- `rejected`: admin declined — must show the admin's rejection reason to the employer, not just a status change with no explanation
- `completed`: budget spent or end date reached

Every status needs a distinct visual badge (reuse the `status--active`/`status--draft`/`status--closed` pattern already built for employer job postings — extend it, don't reinvent it).

### 2.4 Campaign detail / performance page

```
□ Stat cards: Impressions, Clicks, CTR, Amount Spent, Remaining Budget
  (reuse the .stat-card component already established in the dashboard
  shell)
□ A simple performance-over-time chart (daily impressions/clicks) — if no
  charting library is already in the project, flag this to Edudje before
  picking one; don't add a new dependency silently
□ Pause/Resume button (only for active/paused campaigns)
□ Edit button (only for draft/rejected campaigns)
```

### 2.5 What NOT to build yet

```
- No self-serve bidding/auction system — budget is flat-spend, not
  competitive bidding, unless told otherwise
- No A/B testing between creative variants
- No advanced audience segmentation beyond location/industry/role
```
If any of these come up as "obviously needed," flag it as a question rather than building it.

---

## Part 3 — Admin Panel

### 3.1 Pages needed

| Page | Purpose |
|---|---|
| `/admin` | Overview dashboard — pending items across all queues, key platform stats |
| `/admin/jobs` | Job approval queue (PENDING_REVIEW jobs per AGENTS.md) |
| `/admin/ads` | Ad campaign approval queue |
| `/admin/reports` | Moderation queue for reported posts/comments/users/listings (per `11-community-feature-spec.md` Section 7 and the `reports` table) |
| `/admin/users` | User search, view, suspend |

### 3.2 Overview dashboard

Stat cards + quick links to each queue, showing counts:

```
□ Jobs pending review (count + link)
□ Ad campaigns pending review (count + link)
□ Open reports (count + link)
□ Total active users, new signups this week (informational, no action needed)
```

Each pending-count card should be clickable straight into the relevant queue — don't make admin navigate through a generic sidebar to find what needs attention.

### 3.3 Job approval queue

```
□ List of PENDING_REVIEW jobs, newest first
□ Each row: job title, employer, location, salary range, submitted date
□ Click into a job to see the full posting as it would appear publicly
  (reuse the actual job-detail.html rendering, don't build a separate
  preview template that could drift from the real thing)
□ Approve / Reject actions
□ On approve: per AGENTS.md, this must trigger the employer notification
  email AND purge the Redis jobs cache — confirm both actually happen, not
  just the status flip
□ On reject: require a reason (free text), which the employer sees
```

### 3.4 Ad campaign approval queue

Same pattern as jobs: list, click into full preview, approve/reject with required reason on rejection. Approving here is what flips a campaign from `pending_review` to `active`.

### 3.5 Reports/moderation queue

```
□ List of reports with status = pending, newest first
□ Each row: what was reported (post/comment/user/listing), reporter,
  reason, timestamp
□ Click into a report to see the actual reported content in context (the
  real post/comment/listing, not just the text pulled out of context)
□ Actions: dismiss (mark reviewed_dismissed) or action-taken
  (reviewed_actioned — this should also soft-delete the offending content
  or suspend the offending user, whichever is appropriate to what was
  reported)
□ Confirm the report's status actually updates and the item leaves the
  pending queue after action — don't just show a success toast without
  verifying the underlying state changed
```

### 3.6 User management

```
□ Search by name/email
□ View a user's basic profile, account status, and a summary of their
  activity (post count, listing count, report count against them — enough
  to make a moderation decision, not their full history)
□ Suspend / reactivate action, with a required reason logged
```

### 3.7 Admin panel design requirements

```
□ Admin pages are NOT public-facing — they can prioritize information
  density over marketing polish, but they still use the same design tokens
  (colors, spacing, type scale) as the rest of the platform. This is not
  permission to hardcode different colors or skip the token system.
□ Every action (approve, reject, suspend) needs a confirmation step before
  it executes — these are consequential actions, not casual ones.
□ Admin accounts require MFA per AGENTS.md — confirm this is actually
  enforced on the admin panel routes, not just documented as a rule.
```

---

## Part 4 — Definition of Done

Do not consider this complete until every item below is checked, with proof, not just a claim:

```
□ Every item in Section 1.1 checked across every existing page, with bugs
  found listed explicitly and fixes verified
□ Ads Dashboard: all 4 pages built, full creation flow works end to end,
  status badges match the state machine in 2.3
□ Admin Panel: all 5 pages built, approving a job actually triggers the
  email + cache purge, approving an ad actually flips its status, actioning
  a report actually changes the reported content's state
□ Every new page tested at 320/375/768/1440px — zero overflow
□ Every new form tested with empty submission, valid submission, and
  double-submit prevention
□ No new dependency (charting library, etc.) added without flagging it
  first
□ A single written summary listing: what was broken and fixed in Part 1,
  what was built in Part 2, what was built in Part 3 — with screenshots or
  logs proving each claim, organized so it can be reviewed item by item
  rather than as one large diff
```

---

*This spec was written by Edudje Wisdom + Claude (Anthropic). It assumes familiarity with every prior spec in this design system — read them first, not just this document.*
