# Phase 2 — Enhancements
**Status:** 🔄 In Progress
**Prerequisite:** [Phase 1 — Foundation](phase-1-foundation.md) ✅ Done
**Goal:** Turn the app into a tactile book-first experience: login opens directly into a rough paper book, empty squares open a stamping surface, and filled stamps can be released with motion.
**Back to tracker:** [PLANS.md](../PLANS.md)

---

## Features in this Phase
- Slot-based stamping flow
- Click-to-release removal interaction
- Page flip animation (react-pageflip)
- Tactile motion across stamping and page interactions
- Rough journal background and paper texture
- Sound effects (pop, flip, bubble)
- Reference-driven visual polish inspired by the attached screenshots and queensjournal.app

---

## Task Checklist

### 2.1 Slot-Based Stamping Surface
- [x] After login, the user lands on the open book view first
- [x] Empty squares in the book are clickable and open the stamping surface
- [x] The stamping UI is an overlay surface, not a separate dashboard panel
- [x] The selected square index is shown in the stamping UI
- [x] Clicking a square immediately prompts the user to upload a photo
- [x] Users upload a photo and keep the image steady while moving the stamp over it to choose the crop/position
- [x] Replace the placeholder frame/mask treatment with the final uploaded stamp PNG asset from `public/stamp.png`
- [x] Remove the green screen from the stamp PNG and keep only the stamp body visible in the editor
- [x] Copy the green-screen window shape onto the exported image so the saved stamp matches the stamp cutout
- [ ] Add a dedicated description step after pressing the stamp, if the product still needs a separate modal beyond the inline note field

**Acceptance:** Clicking an empty square opens the stamping surface and saving places the result into that exact square.

---

### 2.2 Click-To-Release Removal
- [x] Clicking a filled stamp in the owner view removes it from the page
- [x] Removal uses an animated "blown away" motion instead of disappearing instantly
- [ ] Add particles or paper flecks for a stronger tactile release effect
- [ ] Decide whether public/read-only view should keep a separate view modal later

**Acceptance:** Clicking a filled stamp in the owner view feels like it lifts off the page and disappears.

---

### 2.3 Page Flip Animation (react-pageflip)
- [ ] Wrap `BookViewer` pages in `HTMLFlipBook` from `react-pageflip`
- [ ] Configure realistic page-flip (shadow, perspective)
- [ ] Wire prev/next navigation buttons to `pageFlip.current.flipPrev/Next()`
- [ ] Disable flip on public read-only view (or keep it enabled, reader-mode only)
- [ ] Ensure grid content renders correctly inside flip pages

**Acceptance:** Pages flip with a realistic animation; stamps remain correctly positioned.

---

### 2.4 Framer-Motion Tactile Effects
- [x] **Stamp hover:** Stamps lift slightly on hover before interaction
- [x] **Stamp release:** Filled stamps animate off the page on delete
- [x] **Stamp surface modal:** Overlay enters with scale + fade motion
- [ ] **Stamp press:** Add a short compress-and-settle animation when a new stamp lands in a square
- [ ] **Page transition:** Subtle fade between route changes (`next/navigation` + framer)

**Acceptance:** The book feels tactile and alive rather than static.

---

### 2.5 Ambient Journal Background + Rough Texture
- [x] Shift the palette toward the warm beige/stone paper colors in the reference screenshots
- [x] Add rough paper grain and vignette depth to the page background
- [x] Restyle the book spread to feel like a planner/journal rather than a generic card grid
- [ ] Add reduced-motion-safe ambient light movement or dust only if it improves the scene

**Acceptance:** The background and book feel soft, rough, and paper-like, matching the reference mood.

---

### 2.6 Sound Effects (use-sound)
- [ ] Add sound files to `/public/sounds/`: `pop.mp3`, `flip.mp3`, `bubble.mp3`
- [ ] Play `pop.mp3` when a stamp is pressed into the selected square
- [ ] Play `flip.mp3` when a page is flipped
- [ ] Play `bubble.mp3` when the stamping surface opens
- [ ] Add a global mute toggle (icon button in Navbar) — persist to `localStorage`
- [ ] Respect mute state: check before every `play()` call
- [ ] Do NOT autoplay sounds without user interaction ([OWASP:A5] / browser policy)

**Acceptance:** Sounds play on correct events; mute toggle works; no autoplay violations.

---

### 2.7 Queens Journal-Inspired Book Polish
- [x] Restyle the login-to-book path so the book is the hero immediately after auth
- [x] Add center spine shadow and planner spread composition inspired by queensjournal.app
- [x] Use muted beige, stone, and washed-paper tones from the screenshots instead of the earlier pink-first palette
- [x] Remove extra dashboard chrome so the authenticated screen is just navbar + book
- [x] Reduce the spread size and center the two-page composition on screen
- [ ] Fine-tune typography spacing and micro-details against the final reference pass
- [ ] Check color contrast ratios meet WCAG 2.1 AA (4.5:1 for text) ([WCAG:1.4.3])

**Acceptance:** The product feels closer to a tactile designer journal than a default web app.

---

## Definition of Done — Phase 2
- [ ] All 7 tasks above are checked off
- [ ] Animations are smooth (no jank at 60 fps)
- [ ] `prefers-reduced-motion` tested and respected
- [ ] Sound mute state persists across page reloads
- [ ] All overlays are keyboard-accessible (focus trap + Escape close)
- [ ] No console errors or warnings in dev mode
- [ ] Update [PLANS.md](../PLANS.md) Phase 2 row to ✅ Done

**Previous:** [Phase 1 — Foundation](phase-1-foundation.md)
**Next:** [Phase 3 — Social](phase-3-social.md)
