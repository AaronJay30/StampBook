# Phase 3 — Social
**Status:** 🔲 Not Started
**Prerequisite:** [Phase 2 — Enhancements](phase-2-enhancements.md) ✅ Done
**Goal:** Let users discover each other, like stamps, leave comments, and explore a global feed.
**Back to tracker:** [PLANS.md](../PLANS.md)

---

## Features in this Phase
- User profile pages with avatar upload
- Likes (per stamp)
- Comments (per stamp)
- Global feed (recent stamps + popular users)
- Public book sharing improvements

---

## Task Checklist

### 3.1 User Profile Page
- [ ] Create `/profile/[username]` page (public, no auth required to view)
- [ ] Display: avatar, username, bio, total stamp count, link to `/book/[username]`
- [ ] "Edit Profile" section visible only to the profile owner
- [ ] Edit form: username, bio (save to `profiles` table)
- [ ] Validate username uniqueness on update ([OWASP:A3] — prevent injection via parameterized queries)
- [ ] Show user's most recent 6 stamps as a preview grid

**Acceptance:** Public can view any profile; owner can edit their own; changes persist.

---

### 3.2 Avatar Upload
- [ ] Add avatar upload input on the Edit Profile form
- [ ] Resize/crop image client-side before upload (keep file small, e.g. max 256×256)
- [ ] Upload to Supabase Storage bucket `avatars` at `/{user_id}/avatar.png`
- [ ] Update `profiles.avatar_url` after successful upload
- [ ] Serve avatar via Supabase public URL
- [ ] Sanitize file type (accept only `image/jpeg`, `image/png`, `image/webp`) ([OWASP:A1])
- [ ] Enforce max file size (2 MB) client- and server-side

**Acceptance:** User can upload an avatar; it appears on profile and in stamp modals.

---

### 3.3 Likes
- [ ] Create `likes` table in Supabase:
  ```sql
  id uuid PK, user_id uuid FK→profiles, stamp_id uuid FK→stamps,
  UNIQUE(user_id, stamp_id)
  ```
- [ ] Apply RLS: authenticated users can insert/delete their own likes; anyone can read counts
- [ ] Add like button (heart icon 🩷) to `StampViewModal`
- [ ] Toggle like state optimistically in UI; sync to DB
- [ ] Show like count on each stamp in the modal
- [ ] Prevent self-liking (hide button if stamp belongs to current user, or enforce via DB constraint)

**Acceptance:** Users can like/unlike stamps; counts are accurate and persist.

---

### 3.4 Comments
- [ ] Create `comments` table in Supabase:
  ```sql
  id uuid PK, user_id uuid FK→profiles, stamp_id uuid FK→stamps,
  content text NOT NULL, created_at timestamp DEFAULT now()
  ```
- [ ] Apply RLS: authenticated users can insert their own comments; anyone can read; owners can delete
- [ ] Add comments section to `StampViewModal` — scrollable list below stamp
- [ ] Comment input (textarea, max 200 chars) + "Post" button
- [ ] Sanitize comment content before display ([OWASP:A3] — prevent XSS, use `textContent` not `innerHTML`)
- [ ] Show commenter avatar + username + timestamp
- [ ] Allow comment owner to delete their own comment

**Acceptance:** Users can post and delete comments; XSS mitigation verified.

---

### 3.5 Global Feed
- [ ] Create `/feed` (or `/dashboard` update) page — authenticated users only
- [ ] **Recent Stamps section:** fetch latest 20 stamps across all public books, ordered by `created_at DESC`
- [ ] Display each stamp as a card: image, shape, creator username, like count
- [ ] Clicking a feed stamp opens `StampViewModal` (with like + comment)
- [ ] **Popular Users section:** rank users by total likes received on their stamps (top 6)
- [ ] Show user avatar, username, stamp count, total likes
- [ ] Paginate recent stamps (load-more button or infinite scroll)
- [ ] Only show stamps from users with `is_public = true` books

**Acceptance:** Feed shows real data; popular users ranked correctly; clicking opens modal.

---

### 3.6 Public Book Sharing Improvements
- [ ] Add a "Copy Link" button on the book viewer (copies `/book/[username]` to clipboard)
- [ ] Add Open Graph meta tags to `/book/[username]` for link previews (title, description, first stamp image)
- [ ] Show a book cover preview (first stamp or placeholder) in the feed cards
- [ ] Respect `is_public` — if false, show "This book is private" on the public URL

**Acceptance:** Shared links generate previews; private books are protected.

---

## Definition of Done — Phase 3
- [ ] All 6 tasks above are checked off
- [ ] RLS policies tested — users cannot like/comment as another user ([OWASP:A1])
- [ ] Comment XSS test: posting `<script>alert(1)</script>` renders as plain text
- [ ] Avatar upload rejects non-image files and files > 2 MB
- [ ] Open Graph tags verified with a link preview tool
- [ ] No N+1 queries in feed (use Supabase joins or views)
- [ ] Update [PLANS.md](../PLANS.md) Phase 3 row to ✅ Done

**Previous:** [Phase 2 — Enhancements](phase-2-enhancements.md)

---

## Future Features (Post Phase 3)
These are captured in the spec but out of scope for the current phases:
- Follow system
- Notifications
- Private books
- Collaborative books
- AI auto-crop
- Mobile app (React Native)
