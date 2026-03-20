# StampBook Social

Cute scrapbook-style social platform where users collect memories as stamps inside a shareable book.

## Phase 1 Status

Implemented in the app:

- Authentication flow in local foundation mode
- Protected dashboard and public book sharing
- Konva-based stamp editor with drag, zoom, rotate, crop-by-mask, and shape selection
- 4x3 grid book with automatic slot placement and automatic page creation
- Phase 1 Supabase SQL migration scaffold for profiles, books, pages, stamps, grid slots, storage, and RLS

Still external to the repo:

- Real Supabase credentials in `.env.local`
- Running the SQL migration against your Supabase project
- Deployment

## Quickstart

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

Set these values in `.env.local` when you are ready to switch from local foundation mode to Supabase-backed services:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## Testing Strategy

Regression coverage is designed to stay green as new features are added.

- `tests/foundation-store.test.ts` verifies the core business rules
	- registration creates a profile, book, and first page
	- login creates a valid session
	- stamps fill slots in order and roll over to a new page after slot 12
- `tests/foundation-sharing.test.ts` verifies sharing and sanitization rules
	- private books disappear from the public route contract
	- stamp descriptions are normalized before storage

This gives you a baseline contract: when you add a new feature, `npm run test` should still pass before you consider the change safe.

## Security Notes

- [OWASP:A01] Access control is modeled through session cookies in local mode and mirrored by RLS policies in `supabase/migrations/001_phase1_foundation.sql`.
- [OWASP:A03] User input is validated and normalized for email, username, password, and stamp descriptions.
- [OWASP:A05] Secrets are not committed; Supabase credentials are environment-driven.
- [OWASP:A08] The CI workflow runs lint, tests, build, and a dependency audit check.
- [SOLID:SRP] Core domain rules live in `lib/foundation-store.ts`, separate from UI and route handlers.
- [SOLID:DI] The UI depends on the domain/store API rather than embedding persistence rules.

## Accessibility Notes

- [WCAG:1.4.3] Theme colors use high-contrast text on light surfaces.
- [WCAG:2.1.1] Authentication and book navigation are keyboard reachable.
- [WCAG:3.3.2] Forms use labels and inline validation feedback.

## Supabase Migration

Apply the Phase 1 schema from `supabase/migrations/001_phase1_foundation.sql` in your Supabase project when you are ready to move from local foundation mode to real backend persistence.
