-- Replace the partial unique index from 002 with a proper named constraint.
-- PostgREST (Supabase REST API) requires a real UNIQUE CONSTRAINT (not a
-- partial index) to resolve ON CONFLICT clauses by column name.

-- Drop the partial index added in migration 002
drop index if exists public.pages_book_year_month_unique;

-- Add a proper unique constraint.  PostgreSQL treats NULL as distinct in
-- UNIQUE constraints (NULLS NOT DISTINCT requires PG 15+), so the legacy
-- page row created by the trigger (year IS NULL / month IS NULL) is unaffected.
alter table public.pages
  add constraint pages_book_year_month_key
  unique (book_id, year, month);
