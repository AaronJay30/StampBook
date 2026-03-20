# Phase 1 — Foundation
**Status:** 🔄 In Progress
**Goal:** A working app where a user can sign up, log in, create stamps, and view their personal stamp book.
**Back to tracker:** [PLANS.md](../PLANS.md)

---

## Features in this Phase
- Project setup
- Authentication (email/password via Supabase)
- User profiles
- Full database schema
- Stamp editor with shape masks
- Stamp upload to Supabase Storage
- StampGrid (4×3) with index numbers
- Book/page structure
- Basic public book sharing
- Navbar + Sakura global theme

---

## Task Checklist

### 1.1 Project Setup
- [x] Scaffold Next.js app (`app` router, TypeScript)
- [x] Install dependencies:
  - `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`
  - `react-konva`, `konva`
  - `framer-motion` (install now, use in Phase 2)
  - `react-pageflip` (install now, use in Phase 2)
  - `use-sound` (install now, use in Phase 2)
  - `zustand` (or use React Context)
  - `tailwindcss`
- [x] Configure environment variables (`.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] Set up Tailwind with sakura theme colors in `tailwind.config`
- [x] Set up Supabase client helper (`/lib/supabase.ts`)

**Acceptance:** `npm run dev` starts without errors; Supabase client connects.

---

### 1.2 Authentication
- [x] Create `/login` page — email + password form
- [x] Create `/register` page — email + password form
- [x] Wire Supabase `signInWithPassword` and `signUp`
- [x] Protect routes (redirect unauthenticated users to `/login`)
- [x] Handle auth errors and display user-friendly messages
- [x] Add "Log Out" action

**Acceptance:** User can register, log in, and log out. Protected pages redirect correctly.

---

### 1.3 Profiles
- [x] Create `profiles` table in Supabase:
  ```sql
  id uuid PK (references auth.users)
  username text UNIQUE NOT NULL
  avatar_url text
  bio text
  created_at timestamp DEFAULT now()
  ```
- [x] Create Supabase trigger to auto-insert a profile row on new user signup
- [x] Add username selection step after registration (or on first login)
- [x] Enable Row Level Security (RLS) on `profiles` — users can only update their own row

**Acceptance:** After registration a profile row exists; username is unique and enforced.

---

### 1.4 Database Schema
- [x] Create `books` table:
  ```sql
  id uuid PK, user_id uuid FK→profiles, title text,
  is_public boolean DEFAULT true, created_at timestamp
  ```
- [x] Create `pages` table:
  ```sql
  id uuid PK, book_id uuid FK→books, page_number int
  ```
- [x] Create `stamps` table:
  ```sql
  id uuid PK, user_id uuid FK→profiles,
  image_url text, shape text, description text, created_at timestamp
  ```
- [x] Create `grid_slots` table:
  ```sql
  id uuid PK, page_id uuid FK→pages,
  row int, col int, stamp_id uuid FK→stamps
  UNIQUE(page_id, row, col)
  ```
- [x] Apply RLS policies on all tables
- [x] Auto-create a default book + first page when a user registers

**Acceptance:** Schema migrations run cleanly; RLS prevents cross-user data access.

---

### 1.5 Stamp Editor (react-konva)
- [x] Create `StampEditor` component using `react-konva`
- [x] Support image upload (file input → data URL → Konva Image)
- [x] Enable drag, zoom (pinch/wheel), and rotate handles
- [x] Implement crop (bounding box within canvas area)
- [x] Show a semi-transparent mask shape preview overlay
- [x] "Confirm" button exports canvas as PNG (transparent background)

**Acceptance:** User can upload an image, manipulate it, and export a masked PNG.

---

### 1.6 Stamp Shape Masks
- [x] Implement clip functions for each shape in Konva:
  - `square` — rounded rect clip
  - `circle` — circle clip
  - `heart` — heart path clip
  - `star` — star polygon clip
  - `stamp_edge` — rect with perforated edge effect
- [x] Show shape selector UI (icon buttons) in editor
- [x] Live preview of selected mask applied to image

**Acceptance:** Each shape correctly masks the exported PNG with a transparent background.

---

### 1.7 Stamp Upload + Storage
- [x] Configure Supabase Storage bucket `stamps` (public)
- [x] Upload exported PNG to `/{user_id}/{stamp_id}.png`
- [x] Save stamp record to `stamps` table with `image_url`
- [x] Handle upload errors gracefully

**Acceptance:** After confirming, stamp image is in Storage and URL is stored in the DB.

---

### 1.8 StampGrid Component
- [x] Create `StampGrid` component — 4 rows × 3 columns
- [x] Each cell shows stamp image (if filled) or an empty slot placeholder
- [x] Display index number at bottom-right of each stamp (1–12)
- [x] "Stamp 🌸" button triggers stamp creation flow
- [x] Auto-place new stamp in next available slot

**Acceptance:** Grid renders correctly; stamps fill slots in order; index numbers visible.

---

### 1.9 Book / Page Structure
- [x] `BookViewer` component renders pages from DB
- [x] Fetch user's book → pages → grid_slots → stamps
- [x] Support multiple pages (add new page when current is full)
- [x] Page navigation (prev/next) — simple buttons for now (flip animation in Phase 2)

**Acceptance:** Pages load; stamps persist across sessions; new page added when grid full.

---

### 1.10 Basic Public Sharing
- [x] `/book/[username]` page — public, no auth required
- [x] Fetch book data by username
- [x] Render read-only `StampGrid` (no edit controls)
- [x] Show 404 if user not found or book is not public

**Acceptance:** Visiting `/book/alice` shows Alice's book without logging in.

---

### 1.11 Navbar
- [x] `Navbar` component with:
  - App logo/name ("StampBook 🌸")
  - Link to Dashboard
  - Link to own book
  - Log Out button
- [x] Hide edit controls on public view

**Acceptance:** Navbar appears on all authed pages; correct links per auth state.

---

### 1.12 Sakura Theme + Global Styles
- [x] Set up Tailwind custom colors:
  ```
  primary:    #FFC0CB
  secondary:  #FFDEE9
  accent:     #F8AFA6
  background: #FFF5F7
  ```
- [x] Apply soft rounded style to all buttons
- [x] Add paper texture CSS (background-image or Tailwind plugin)
- [x] Add soft box-shadow utility class
- [x] Set global font (suggest: "Nunito" or "M PLUS Rounded 1c")

**Acceptance:** Visual matches the sakura/kawaii theme across all pages.

---

## Definition of Done — Phase 1
- [x] All 12 tasks above are checked off
- [x] No console errors in dev mode
- [ ] Supabase RLS tested (user A cannot read/write user B's data)
- [x] App deployed to Vercel (or local build passes `next build`)
- [ ] Update [PLANS.md](../PLANS.md) Phase 1 row to ✅ Done

**Next:** [Phase 2 — Enhancements](phase-2-enhancements.md)
