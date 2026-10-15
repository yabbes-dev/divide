-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
-- The app talks to these tables with the secret service_role key.
-- Row level security stays on and has no public policies, so the anon key cannot read them.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_key text not null,
  code_hash text not null,
  code_salt text not null,
  created_at timestamptz not null default now(),
  constraint profiles_username_len check (char_length(username) between 2 and 24)
);

create unique index if not exists profiles_username_key_unique
  on public.profiles (username_key);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  name_key text not null,
  created_at timestamptz not null default now(),
  constraint groups_name_len check (char_length(name) between 1 and 40)
);

create unique index if not exists groups_name_unique_per_profile
  on public.groups (profile_id, name_key);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  display_name text not null,
  sort_order integer not null,
  constraint group_members_name_len check (char_length(display_name) between 1 and 40)
);

create index if not exists group_members_group_id_idx
  on public.group_members (group_id, sort_order);

create table if not exists public.sessions (
  token_hash text primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_profile_id_idx
  on public.sessions (profile_id);

create table if not exists public.login_attempts (
  id bigint generated always as identity primary key,
  username_key text not null,
  ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists login_attempts_username_idx
  on public.login_attempts (username_key, created_at desc);

create index if not exists login_attempts_ip_idx
  on public.login_attempts (ip, created_at desc);

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.sessions enable row level security;
alter table public.login_attempts enable row level security;
