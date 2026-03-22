-- Add year and month columns to pages so each page maps to a calendar month
alter table public.pages
  add column if not exists year integer check (year > 1900),
  add column if not exists month integer check (month between 0 and 11);

-- Each book can only have one page per year+month combination
create unique index if not exists pages_book_year_month_unique
  on public.pages (book_id, year, month)
  where year is not null and month is not null;
