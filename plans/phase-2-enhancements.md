# Phase 2 — Enhancements
**Status:** 🔲 Not Started
**Prerequisite:** [Phase 1 — Foundation](phase-1-foundation.md) ✅ Done
**Goal:** Make the app feel alive — polished modals, animations, page flip, sakura effects, and sounds.
**Back to tracker:** [PLANS.md](../PLANS.md)

---

## Features in this Phase
- Description modal after stamp creation
- Stamp view modal on click
- Page flip animation (react-pageflip)
- Framer-motion micro-animations across the app
- Falling sakura petals background
- Sound effects (pop, flip, bubble)
- Paper texture + soft shadow polish

---

## Task Checklist

### 2.1 Description Modal (after stamp creation)
- [ ] After a stamp is placed in the grid, open `StampDescriptionModal`
- [ ] Fields: `description` (textarea, max 280 chars)
- [ ] Save description to the `stamps` table on submit
- [ ] framer-motion entrance: `scale_fade_in` (scale from 0.8 + opacity 0 → 1)
- [ ] framer-motion exit: `scale_fade_out`
- [ ] "Skip" option — closes without saving a description
- [ ] Trap focus inside modal (accessibility — [WCAG:2.1.2])
- [ ] Close on backdrop click or Escape key

**Acceptance:** Modal appears after every stamp placement; description saves to DB; animations play.

---

### 2.2 Stamp View Modal (click on stamp)
- [ ] Clicking any stamp in the grid opens `StampViewModal`
- [ ] Modal displays: stamp image (large), description, creator username + avatar
- [ ] framer-motion entrance: `zoom_bounce` (spring scale from 0.5 → 1)
- [ ] framer-motion exit: `fade` (opacity 1 → 0)
- [ ] Show "Edit" button only if the stamp belongs to the current user
- [ ] "Edit" reopens description field inline for update
- [ ] Trap focus; close on backdrop click or Escape key ([WCAG:2.1.2])

**Acceptance:** Clicking a stamp shows the animated modal with correct content.

---

### 2.3 Page Flip Animation (react-pageflip)
- [ ] Wrap `BookViewer` pages in `HTMLFlipBook` from `react-pageflip`
- [ ] Configure realistic page-flip (shadow, perspective)
- [ ] Wire prev/next navigation buttons to `pageFlip.current.flipPrev/Next()`
- [ ] Disable flip on public read-only view (or keep it enabled, reader-mode only)
- [ ] Ensure grid content renders correctly inside flip pages

**Acceptance:** Pages flip with a realistic animation; stamps remain correctly positioned.

---

### 2.4 Framer-Motion Micro-Animations
- [ ] **Button bounce:** `whileTap={{ scale: 0.9 }}` + `whileHover={{ scale: 1.05 }}` on all primary buttons
- [ ] **Stamp drop:** New stamp animates into grid slot (`y: -20 → 0`, `opacity: 0 → 1`)
- [ ] **Hover zoom:** Stamp thumbnails scale up on hover (`whileHover={{ scale: 1.08 }}`)
- [ ] **Modal scale:** Shared `AnimatePresence` wrapper around modals for enter/exit
- [ ] **Page transition:** Subtle fade between route changes (`next/navigation` + framer)

**Acceptance:** All interactive elements have visible, non-jarring micro-animations.

---

### 2.5 Falling Sakura Petals
- [ ] Create `SakuraPetals` component (Canvas or CSS-animated `<div>` elements)
- [ ] Generate 15–25 petals at random horizontal positions
- [ ] Each petal: random size (8–18 px), random fall duration (4–9 s), gentle horizontal drift
- [ ] Use soft pink colors (`#FFC0CB`, `#FFDEE9`, `#F8AFA6`)
- [ ] Mount over the page background, `pointer-events: none` ([WCAG:1.4.3] — decorative)
- [ ] Add `prefers-reduced-motion` check — disable animation if user prefers ([WCAG:2.3.3])

**Acceptance:** Petals fall continuously on all pages; motion preference respected; no interaction blocked.

---

### 2.6 Sound Effects (use-sound)
- [ ] Add sound files to `/public/sounds/`: `pop.mp3`, `flip.mp3`, `bubble.mp3`
- [ ] Play `pop.mp3` when a stamp is confirmed and placed
- [ ] Play `flip.mp3` when a page is flipped
- [ ] Play `bubble.mp3` when any modal opens
- [ ] Add a global mute toggle (icon button in Navbar) — persist to `localStorage`
- [ ] Respect mute state: check before every `play()` call
- [ ] Do NOT autoplay sounds without user interaction ([OWASP:A5] / browser policy)

**Acceptance:** Sounds play on correct events; mute toggle works; no autoplay violations.

---

### 2.7 Paper Texture + Soft Shadow Polish
- [ ] Apply paper texture as a subtle CSS `background-image` (repeating PNG or CSS noise)
- [ ] Add `box-shadow: 0 4px 24px rgba(248,175,166,0.18)` to cards and modals
- [ ] Ensure stamp images render with a slight drop shadow
- [ ] Review all pages for visual consistency with sakura theme
- [ ] Check color contrast ratios meet WCAG 2.1 AA (4.5:1 for text) ([WCAG:1.4.3])

**Acceptance:** App has a consistent, polished scrapbook aesthetic.

---

## Definition of Done — Phase 2
- [ ] All 7 tasks above are checked off
- [ ] Animations are smooth (no jank at 60 fps)
- [ ] `prefers-reduced-motion` tested and respected
- [ ] Sound mute state persists across page reloads
- [ ] All modals are keyboard-accessible (focus trap + Escape close)
- [ ] No console errors or warnings in dev mode
- [ ] Update [PLANS.md](../PLANS.md) Phase 2 row to ✅ Done

**Previous:** [Phase 1 — Foundation](phase-1-foundation.md)
**Next:** [Phase 3 — Social](phase-3-social.md)
