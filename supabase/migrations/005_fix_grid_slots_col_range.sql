-- The right page renders Fri (col 4), Sat (col 5), Sun (col 6).
-- Migration 004 only expanded to col 0-3. This expands to 0-6 to cover all days.

alter table public.grid_slots
  drop constraint grid_slots_col_check,
  add constraint grid_slots_col_check check (col between 0 and 6);
