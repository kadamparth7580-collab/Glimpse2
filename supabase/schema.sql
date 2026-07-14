-- =========================================================
-- Glimpse — Supabase schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor)
-- =========================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- profiles
-- A tiny table so we can show a display name for each of the
-- two users instead of a raw user id. Auto-created for every
-- new auth user via trigger below.
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Someone',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by any signed in user"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-insert a profile row whenever a new auth user is created.
-- Display name defaults to the part of the email before the @,
-- or whatever is passed in raw_user_meta_data->>'display_name'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- glimpses
-- ---------------------------------------------------------
create table if not exists public.glimpses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index if not exists glimpses_expires_at_idx on public.glimpses (expires_at desc);
create index if not exists glimpses_created_at_idx on public.glimpses (created_at desc);

alter table public.glimpses enable row level security;

-- Both users can see every glimpse (expiry filtering happens in the app query,
-- so a poster can still see their own glimpse's thread briefly after it expires).
create policy "Signed in users can view glimpses"
  on public.glimpses for select
  to authenticated
  using (true);

create policy "Users can post their own glimpses"
  on public.glimpses for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own glimpses"
  on public.glimpses for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- comments
-- ---------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  glimpse_id uuid not null references public.glimpses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists comments_glimpse_id_idx on public.comments (glimpse_id, created_at asc);

alter table public.comments enable row level security;

create policy "Signed in users can view comments"
  on public.comments for select
  to authenticated
  using (true);

create policy "Users can post their own comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- Enable realtime updates for live comment threads
alter publication supabase_realtime add table public.comments;

-- ---------------------------------------------------------
-- Storage bucket for photos
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('glimpses', 'glimpses', true)
on conflict (id) do nothing;

-- Anyone signed in can upload, only to a folder named after their own user id
create policy "Users can upload their own glimpse photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'glimpses'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view glimpse photos"
  on storage.objects for select
  to public
  using (bucket_id = 'glimpses');

create policy "Users can delete their own glimpse photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'glimpses'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------
-- Manual setup reminder (this app is for exactly two people):
-- Create the two accounts from the Supabase Dashboard
-- -> Authentication -> Users -> Add user (set email + password).
-- Optionally set user_metadata.display_name for a nicer poster name.
-- ---------------------------------------------------------
