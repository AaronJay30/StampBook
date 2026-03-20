create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  avatar_url text,
  bio text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  title text not null default 'My Stamp Book',
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  page_number integer not null check (page_number > 0),
  unique (book_id, page_number)
);

create table if not exists public.stamps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  image_url text not null,
  shape text not null check (shape in ('square', 'circle', 'heart', 'star', 'stamp_edge')),
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.grid_slots (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  row integer not null check (row between 0 and 3),
  col integer not null check (col between 0 and 2),
  stamp_id uuid not null unique references public.stamps (id) on delete cascade,
  unique (page_id, row, col)
);

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.pages enable row level security;
alter table public.stamps enable row level security;
alter table public.grid_slots enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_username text;
  book_id uuid;
begin
  generated_username := lower(split_part(coalesce(new.email, gen_random_uuid()::text), '@', 1));

  insert into public.profiles (id, username)
  values (new.id, generated_username)
  on conflict (id) do nothing;

  insert into public.books (user_id)
  values (new.id)
  returning id into book_id;

  insert into public.pages (book_id, page_number)
  values (book_id, 1)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create policy "Profiles are public to read"
on public.profiles
for select
using (true);

create policy "Users update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Books readable when public or owner"
on public.books
for select
using (is_public or auth.uid() = user_id);

create policy "Users manage own books"
on public.books
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Pages readable when parent book is readable"
on public.pages
for select
using (
  exists (
    select 1
    from public.books
    where books.id = pages.book_id
      and (books.is_public or books.user_id = auth.uid())
  )
);

create policy "Users manage pages in own books"
on public.pages
for all
using (
  exists (
    select 1
    from public.books
    where books.id = pages.book_id
      and books.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.books
    where books.id = pages.book_id
      and books.user_id = auth.uid()
  )
);

create policy "Stamps readable when book is readable"
on public.stamps
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.grid_slots
    join public.pages on pages.id = grid_slots.page_id
    join public.books on books.id = pages.book_id
    where grid_slots.stamp_id = stamps.id
      and books.is_public
  )
);

create policy "Users manage own stamps"
on public.stamps
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Grid slots readable when page is readable"
on public.grid_slots
for select
using (
  exists (
    select 1
    from public.pages
    join public.books on books.id = pages.book_id
    where pages.id = grid_slots.page_id
      and (books.is_public or books.user_id = auth.uid())
  )
);

create policy "Users manage own grid slots"
on public.grid_slots
for all
using (
  exists (
    select 1
    from public.pages
    join public.books on books.id = pages.book_id
    where pages.id = grid_slots.page_id
      and books.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.pages
    join public.books on books.id = pages.book_id
    where pages.id = grid_slots.page_id
      and books.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('stamps', 'stamps', true)
on conflict (id) do nothing;

create policy "Public stamp images readable"
on storage.objects
for select
using (bucket_id = 'stamps');

create policy "Users upload own stamp images"
on storage.objects
for insert
with check (
  bucket_id = 'stamps'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update own stamp images"
on storage.objects
for update
using (
  bucket_id = 'stamps'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'stamps'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users delete own stamp images"
on storage.objects
for delete
using (
  bucket_id = 'stamps'
  and auth.uid()::text = (storage.foldername(name))[1]
);