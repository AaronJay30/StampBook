# StampBook Social — Master Plan Tracker

> **Theme:** Sakura Kawaii · **Framework:** Next.js + Supabase
> Use this file to track overall progress. Each phase has its own detailed plan file.

---

## Phases Overview

| Phase | Name | Status | Plan File |
|-------|------|--------|-----------|
| 1 | Foundation | 🔄 In Progress | [plans/phase-1-foundation.md](plans/phase-1-foundation.md) |
| 2 | Enhancements | 🔲 Not Started | [plans/phase-2-enhancements.md](plans/phase-2-enhancements.md) |
| 3 | Social | 🔲 Not Started | [plans/phase-3-social.md](plans/phase-3-social.md) |

**Status Legend:** 🔲 Not Started · 🔄 In Progress · ✅ Done · 🚫 Blocked

---

## Phase 1 — Foundation
> Goal: A working app where a user can sign up, create stamps, and view their book.

| # | Feature | Status |
|---|---------|--------|
| 1.1 | Project Setup (Next.js + Supabase + deps) | ✅ |
| 1.2 | Authentication (email/password) | ✅ |
| 1.3 | Profiles table + profile creation | ✅ |
| 1.4 | Database schema (books, pages, stamps, grid_slots) | ✅ |
| 1.5 | Stamp Editor (react-konva: drag, zoom, rotate, crop, mask) | ✅ |
| 1.6 | Stamp shape masks (square, circle, heart, star, stamp_edge) | ✅ |
| 1.7 | Stamp upload + storage (Supabase Storage) | ✅ |
| 1.8 | StampGrid component (4×3, indexed) | ✅ |
| 1.9 | Book/Page structure (1 book per user, multiple pages) | ✅ |
| 1.10 | Basic sharing (public book URL `/book/[username]`) | ✅ |
| 1.11 | Navbar component | ✅ |
| 1.12 | Sakura theme + global styles | ✅ |

---

## Phase 2 — Enhancements
> Goal: Make the app feel alive with modals, animations, and sound.

| # | Feature | Status |
|---|---------|--------|
| 2.1 | Description modal after stamp creation (framer-motion) | 🔲 |
| 2.2 | Stamp view modal on click (framer-motion) | 🔲 |
| 2.3 | Page flip animation (react-pageflip) | 🔲 |
| 2.4 | Framer-motion effects (button bounce, stamp drop, hover zoom) | 🔲 |
| 2.5 | Falling sakura petals background effect | 🔲 |
| 2.6 | Sound effects (use-sound: pop, flip, bubble) | 🔲 |
| 2.7 | Paper texture + soft shadow polish | 🔲 |

---

## Phase 3 — Social
> Goal: Let users discover each other, like stamps, and leave comments.

| # | Feature | Status |
|---|---------|--------|
| 3.1 | User profiles page (`/profile/[username]`) | 🔲 |
| 3.2 | Avatar upload (Supabase Storage) | 🔲 |
| 3.3 | Likes (likes table + UI) | 🔲 |
| 3.4 | Comments (comments table + UI) | 🔲 |
| 3.5 | Global feed (recent stamps + popular users) | 🔲 |
| 3.6 | Public book sharing improvements | 🔲 |

---

## Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) |
| State | React Context or Zustand |
| Auth + DB + Storage | Supabase |
| Canvas Editor | react-konva |
| Animations | framer-motion |
| Page Flip | react-pageflip |
| Sounds | use-sound |

---

## Dependency Map

```
Phase 1 (Foundation)
  └──> Phase 2 (Enhancements)  ← requires Phase 1 complete
        └──> Phase 3 (Social)  ← requires Phase 2 (or at least Phase 1 + 2 core)
```

> **Rule:** Complete all ✅ items in a phase before moving to the next.
> Update this file and the relevant phase plan file as work progresses.
