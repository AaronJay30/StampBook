-- Fix grid_slots col constraint to allow 4 columns (Mon-Thu on left page).
-- The left page renders Monday-Thursday (4 days = columns 0-3),
-- but the original constraint only allowed 0-2.

alter table public.grid_slots
  drop constraint grid_slots_col_check,
  add constraint grid_slots_col_check check (col between 0 and 3);
