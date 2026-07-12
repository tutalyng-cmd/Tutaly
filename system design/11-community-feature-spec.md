# 11 — Community Feature Spec: Connect Social Feed
**For: Antigravity** | **Owner: Edudje Wisdom** | **Status: Ready to build**

> Read this in full before writing any code. This spec covers the complete Connect community feature — posts, comments, likes, image attachments, follows, notifications, and moderation. It assumes you have already read `10-master-prompt.md` and the rest of the design system. Where this document is silent, the master prompt governs.

---

## 1. What We're Building

Connect is Tutaly's professional social feed — think LinkedIn's feed mechanics with Instagram-style media handling. Users post text updates, attach up to 4 images, and others like, comment, and follow. This is real user-generated content with real moderation needs, not a toy feature.

**In scope for this build:**
- Create/edit/delete posts (text + up to 4 images)
- Like/unlike posts and comments
- Comment on posts, with one level of replies (no infinite nesting)
- Follow/unfollow users
- Infinite-scroll feed (following-based, chronological)
- Image upload, storage, and display (Instagram-style grid layout)
- Notifications (like, comment, follow, reply)
- Reporting and blocking

**Explicitly out of scope for this build** (flag to Edudje before starting, don't build speculatively):
- Video uploads
- Direct messaging
- Post scheduling
- Algorithmic (non-chronological) feed ranking
- Stories/ephemeral content

---

## 2. Non-Negotiables (in addition to `10-master-prompt.md`)

```
1. TypeORM synchronize stays false. Every schema change is a migration. No exceptions.
2. All media uploads go through the presigned-URL flow in Section 5 — never accept
   raw file bytes directly into a NestJS controller body.
3. Every write endpoint (post, comment, like, follow, report) is rate-limited.
   Numbers are in Section 8. This is not optional — UGC without rate limits gets abused fast.
4. Every list endpoint (feed, comments, notifications) is paginated. Never return
   an unbounded array.
5. Soft-delete posts and comments (deleted_at timestamp). Never hard-delete —
   moderation and abuse investigation need the record to still exist.
6. All user-facing text in this feature follows 08-copy-voice.md. No "Oops!",
   no exclamation-mark enthusiasm, no generic errors.
7. Every state — loading, empty, error, success — is implemented before this
   feature is considered done. Reference 09-feedback-system.md for each one.
```

---

## 3. Data Model

All tables use `uuid` primary keys, `created_at`/`updated_at` timestamps (`timestamptz`, default `now()`), and standard TypeORM entity conventions matching the rest of the codebase.

### `posts`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| author_id | uuid | FK → users.id |
| body | text | max 3,000 chars, enforced at API layer |
| visibility | enum | `public`, `connections_only` — default `public` |
| like_count | int | denormalized counter, default 0 |
| comment_count | int | denormalized counter, default 0 |
| edited_at | timestamptz, nullable | set when body is edited |
| deleted_at | timestamptz, nullable | soft delete |
| created_at | timestamptz | |

Denormalized counters (`like_count`, `comment_count`) are updated transactionally alongside the like/comment insert — never computed with a `COUNT()` on read. The feed will be hit too often for that to scale.

### `post_media`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| post_id | uuid | FK → posts.id, cascade delete |
| media_url | text | final CDN URL after processing |
| media_type | enum | `image` only for this build |
| width | int | original width in px |
| height | int | original height in px |
| order_index | smallint | 0–3, controls display order in the grid |

Max 4 rows per `post_id`, enforced at the API layer before the post is allowed to publish.

### `post_likes`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| post_id | uuid | FK → posts.id, cascade delete |
| user_id | uuid | FK → users.id |
| created_at | timestamptz | |

**Unique constraint on `(post_id, user_id)`** — this is what makes like/unlike idempotent. Do not skip this constraint and try to enforce uniqueness in application code only.

### `comments`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| post_id | uuid | FK → posts.id, cascade delete |
| author_id | uuid | FK → users.id |
| parent_comment_id | uuid, nullable | FK → comments.id — null means top-level comment |
| body | text | max 1,000 chars |
| like_count | int | denormalized, default 0 |
| deleted_at | timestamptz, nullable | soft delete |
| created_at | timestamptz | |

**Reply depth is capped at 1.** If `parent_comment_id` is set, and that parent comment *also* has a `parent_comment_id`, reject the request with a 400. This is a deliberate product decision — deep comment threads don't work well in a professional feed context and create a much harder UI problem than it's worth.

### `comment_likes`
Same shape as `post_likes`, referencing `comments.id` instead. Same unique constraint rule.

### `follows`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| follower_id | uuid | FK → users.id |
| following_id | uuid | FK → users.id |
| created_at | timestamptz | |

Unique constraint on `(follower_id, following_id)`. Add a check constraint preventing `follower_id = following_id` — users can't follow themselves.

### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| recipient_id | uuid | FK → users.id |
| actor_id | uuid | FK → users.id — who triggered it |
| type | enum | `post_like`, `post_comment`, `comment_reply`, `comment_like`, `new_follower` |
| target_type | enum | `post`, `comment`, `user` |
| target_id | uuid | id of the post/comment/user the notification refers to |
| read_at | timestamptz, nullable | |
| created_at | timestamptz | |

### `reports`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| reporter_id | uuid | FK → users.id |
| target_type | enum | `post`, `comment`, `user` |
| target_id | uuid | |
| reason | enum | `spam`, `harassment`, `misinformation`, `inappropriate_content`, `other` |
| details | text, nullable | free-text, max 500 chars, required if reason = `other` |
| status | enum | `pending`, `reviewed_actioned`, `reviewed_dismissed` — default `pending` |
| created_at | timestamptz | |

### `blocks`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| blocker_id | uuid | FK → users.id |
| blocked_id | uuid | FK → users.id |
| created_at | timestamptz | |

A block is bidirectional in effect even though the row is one-directional: if A blocks B, neither can see the other's posts, follow each other, or comment on each other's content. Enforce this at the query layer (every feed/post/comment query excludes content from blocked relationships in either direction).

### 3.1 Required Database Indexes
Without proper indexing, the feed query will degrade quickly as data grows. Ensure the following indexes are created:
1. **`posts(author_id, created_at DESC)`**: Essential for the feed query which filters by a list of `author_id`s and sorts by `created_at`.
2. **`follows(follower_id)`**: Crucial for quickly retrieving the list of users the current user is following to power the feed.

---

## 4. API Contract

All endpoints are under `/api/v1/community/`. Standard NestJS DTO validation on every input. Every response follows the existing API envelope pattern already used elsewhere in the codebase — don't invent a new response shape for this feature.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/posts` | Create a post |
| GET | `/posts/feed` | Paginated following-feed |
| GET | `/posts/:id` | Single post detail |
| PATCH | `/posts/:id` | Edit own post body (media cannot be edited after publish — delete and repost) |
| DELETE | `/posts/:id` | Soft-delete own post |
| POST | `/posts/:id/like` | Like (idempotent — liking an already-liked post returns 200, not 409) |
| DELETE | `/posts/:id/like` | Unlike |
| GET | `/posts/:id/comments` | Paginated top-level comments, each with up to 3 preview replies + a "view N more replies" count |
| POST | `/posts/:id/comments` | Create comment or reply |
| DELETE | `/comments/:id` | Soft-delete own comment |
| POST | `/comments/:id/like` | Like a comment |
| DELETE | `/comments/:id/like` | Unlike a comment |
| POST | `/media/upload-url` | Request a presigned upload URL (see Section 5) |
| POST | `/users/:id/follow` | Follow |
| DELETE | `/users/:id/follow` | Unfollow |
| GET | `/users/:id/followers` | Paginated |
| GET | `/users/:id/following` | Paginated |
| GET | `/notifications` | Paginated, newest first |
| POST | `/notifications/:id/read` | Mark one as read |
| POST | `/notifications/read-all` | Mark all as read |
| POST | `/reports` | Submit a report |
| POST | `/users/:id/block` | Block a user |
| DELETE | `/users/:id/block` | Unblock |

### Feed Architecture & Pagination
- **Fan-out on Read:** For this initial launch, the feed uses a fan-out-on-read approach (`WHERE author_id IN (following_list) ORDER BY created_at DESC`). While this is the correct starting choice, be aware it has a ceiling. Once users follow hundreds of accounts or traffic grows significantly, this will need to be revisited and potentially migrated to a fan-out-on-write architecture.
- **Cursor Pagination:** The feed uses cursor-based pagination (`?cursor=<post_id>&limit=20`, max 20). Cursor pagination avoids the classic "new post pushed everything down, user sees duplicate posts on page 2" bug that offset pagination has on a live feed.
- **Prevent N+1 Queries:** When fetching a feed page, the query MUST batch the "did the current user like this post?" check. Do not perform an N+1 query per post. Fetch the likes for the returned post IDs in a single batched query or use an aggregate join.
- **Caching Layer:** The first page of the feed for active users should be cached in Upstash Redis to prevent heavy DB hits on hot feeds. The cache should be invalidated or updated intelligently when new posts arrive.

### Create post payload
```json
{
  "body": "string, required unless media present, max 3000 chars",
  "media": [
    { "media_url": "string, from upload-url flow", "width": 1080, "height": 1350, "order_index": 0 }
  ],
  "visibility": "public | connections_only"
}
```
A post needs *either* `body` text *or* at least one media item — never allow a fully empty post to publish. Validate this server-side, not just in the UI.

---

## 5. Image Upload Flow

**Never accept raw image bytes in a NestJS controller.** Use the presigned-URL pattern:

```
1. Client calls POST /media/upload-url with { fileName, fileType, fileSizeBytes }
2. Server validates:
   - fileType is one of: image/jpeg, image/png, image/webp
   - fileSizeBytes ≤ 10MB
   - Returns a presigned PUT URL (S3-compatible — use whatever object storage
     is already provisioned for the project; if none exists yet, flag this to
     Edudje before proceeding, this is an infra decision above your authority)
3. Client uploads the file directly to the presigned URL (bypasses the API server entirely)
4. On upload completion, client calls POST /posts with the resulting media_url
5. A background job processes the uploaded image: strips EXIF data, generates
   a display-optimized version (max 1600px longest edge, WebP), and a thumbnail (400px).
   **Crucially, this must run on a durable queue (BullMQ against Upstash Redis)**, not just an async 
   fire-and-forget call that dies if the server restarts. The post's media_url is only considered 
   "ready" once this job completes — show a processing state in the UI.

6. **CDN for Reads:** While presigned uploads solve the write bandwidth problem, serving images 
   requires a CDN (e.g., Cloudflare or CloudFront) in front of the object storage (S3/R2). 
   Never serve raw image reads directly from the S3 bucket to every feed viewer.
```

**Why this matters:** routing image bytes through the NestJS API server means every image upload consumes a request-handling thread and API server bandwidth for something that's purely I/O. At any real scale this becomes the first thing that falls over. The presigned-URL pattern is standard practice for exactly this reason — this isn't optional complexity, it's the difference between a feature that works at 100 users and one that works at 100,000.

**EXIF stripping is a hard requirement, not a nice-to-have.** Photos can carry embedded GPS coordinates. Publishing a user's home or workplace location without their knowledge is a real privacy harm. Strip all EXIF metadata server-side before the image is ever served publicly.

### Image display: Instagram-style grid
- 1 image → full width, max height 500px, `object-fit: cover`
- 2 images → 50/50 side by side
- 3 images → 1 large (left, full height) + 2 stacked (right)
- 4 images → 2×2 grid
- Clicking any image opens a lightbox with left/right navigation between that post's images

---

## 6. Frontend Components

Build these as new components under the existing Connect feature module — do not create a parallel component tree. Reuse the visual patterns already established in the Connect page mockup (`.feed-post`, `.composer`, `.profile-card` classes) rather than inventing new class names for the same concepts.

| Component | Responsibility |
|---|---|
| `FeedList` | Infinite-scroll container, fetches pages via cursor, renders `PostCard` list |
| `PostComposer` | Text input + image picker (max 4) + image preview strip with remove buttons + post button. Disabled while an upload is in flight. |
| `PostCard` | Author row, body text, image grid, like/comment/share action bar, relative timestamp |
| `ImageGrid` | Implements the 1/2/3/4-image layout rules from Section 5 |
| `ImageLightbox` | Full-screen image viewer with left/right nav |
| `LikeButton` | Optimistic UI: toggle instantly on click, roll back if the API call fails. Never make the user wait for a round-trip to see their like register. |
| `CommentThread` | Top-level comments + reply previews + "view more replies" expansion |
| `CommentComposer` | Reused for both top-level comments and replies |
| `NotificationBell` | Unread count badge, dropdown list |
| `ReportModal` | Reason selector + optional detail text, used for posts/comments/users |
| `ProfileFeedTab` | A user's own posts, shown on their profile page |

### Required states per component
Every list-rendering component (`FeedList`, `CommentThread`, `NotificationBell`) needs all four:
- **Loading** — skeleton screens matching the shape of the content (per `09-feedback-system.md`), not a spinner, for the initial feed load. A spinner is acceptable for "load more" at the bottom of an existing list.
- **Empty** — `FeedList` empty state: "Your feed is empty" / "Follow professionals and companies to build your feed." / CTA to `/connect/discover`. This copy is already specified in `07-illustrations.md` — use it verbatim, don't improvise new copy.
- **Error** — "Couldn't load your feed. Check your connection and try again." with a retry button. Never fail silently.
- **Populated** — the normal case.

---

## 7. Moderation & Safety

This is a professional platform with real names attached to posts. Get this wrong and it becomes a liability, not a feature.

1. **Reporting**: any post, comment, or user can be reported. Reported content is *not* automatically hidden — it goes to a moderation queue (a simple admin-panel list is enough for this build; don't build a full moderation dashboard unless separately scoped).
2. **Blocking**: immediate and mutual in effect, per the `blocks` table rules in Section 3.
3. **Rate limiting**: see Section 8 — this is itself a moderation control, not just a performance one.
4. **No anonymous posting.** Every post and comment is attributed to a real user account. This is a deliberate difference from the anonymous salary/review submissions elsewhere on Tutaly — the community feed is identity-attached by design.
5. **Image content**: at minimum, run uploaded images through an automated moderation check (many object-storage/CDN providers offer this as an add-on) before they're marked "ready" for public display. If no such service is provisioned, flag this to Edudje as a pre-launch blocker — shipping unmoderated public image upload on a professional platform is a real risk, not a hypothetical one.

---

## 8. Rate Limits

Enforce server-side (Upstash Redis is already provisioned for the project — use it for this):

| Action | Limit |
|---|---|
| Create post | 10 per hour per user |
| Create comment | 30 per hour per user |
| Like/unlike | 200 per hour per user (generous — this is meant to catch bot behavior, not slow down normal use) |
| Follow | 50 per hour per user |
| Report | 20 per hour per user |
| Media upload-url requests | 40 per hour per user |

Return `429` with a `retry_after` field when a limit is hit. The frontend should surface this as a calm, specific message — never a generic error.

---

## 9. Notifications — Delivery Rules

- A user never gets a notification for their own action (liking your own post generates nothing).
- Multiple likes on the same post within a short window should collapse into one notification ("Kemi and 4 others liked your post"), not create N separate rows. Implement this as an upsert-and-increment pattern on a recent unread notification of the same type+target, rather than always inserting a new row.
- Notification read-state is per-user, obviously, but also: opening the notification dropdown does *not* automatically mark everything read. Only an explicit "mark all read" action or clicking an individual notification does.

---

## 10. Definition of Done

Before this feature is considered complete, verify every item:

```
□ All seven tables migrated (never synchronize:true)
□ Required composite indexes on `posts` and `follows` created
□ Feed query uses fan-out-on-read with Redis caching for the first page
□ N+1 query risk eliminated for "user liked this" status on the feed
□ Every write endpoint rate-limited per Section 8
□ Every list endpoint cursor-paginated, capped server-side
□ post_likes and comment_likes have the unique constraint — verify like/unlike
  is truly idempotent by calling it twice in a row
□ Soft delete only — no DELETE FROM posts/comments in any code path
□ Image upload goes through presigned URL, never through the API server body
□ Image processing runs on a durable BullMQ queue
□ CDN configured for public image reads
□ EXIF stripped from every uploaded image before public display
□ Image moderation check in place, or explicitly flagged to Edudje as a
  pre-launch blocker if no service is provisioned
□ Blocking is verified bidirectional — test that neither party can see the
  other's content after a block, from both directions
□ Reply depth capped at 1 — verify a reply-to-a-reply is rejected
□ Every component has loading, empty, error, and populated states implemented
□ Empty feed state uses the exact copy from 07-illustrations.md
□ LikeButton updates optimistically and rolls back cleanly on API failure
□ Tested at 375px, 768px, and 1440px — no horizontal overflow anywhere
  (this has been a repeat problem across other Tutaly pages — check carefully)
□ Notification collapsing verified — 5 likes in a row produce 1 notification,
  not 5
```

---

## 11. Open Decisions for Edudje (do not decide these unilaterally)

```
🚩 DECISION NEEDED: Object storage provider
Context: Media upload flow (Section 5) needs a presigned-URL-capable object
store. Not yet confirmed in the project's provisioned infrastructure.
Option A: AWS S3 — most common, well-documented, works with any CDN
Option B: Cloudflare R2 — no egress fees, good fit if the rest of the stack
leans Cloudflare
Recommendation: needs Edudje's infra call before build starts on Section 5.

🚩 DECISION NEEDED: Image moderation service
Context: Section 7 requires automated image moderation before public display.
Option A: Provider-native (e.g. AWS Rekognition if S3 is chosen)
Option B: Third-party API (e.g. Sightengine, Hive)
Option C: Ship without it for an initial closed beta, add before public launch
Recommendation: Option C is acceptable only if the beta user base is small
and invite-only. Flag clearly if this is the path taken.
```

---

*This spec was written by Edudje Wisdom + Claude (Anthropic) to be handed directly to Antigravity. Read together with `10-master-prompt.md` before starting.*
