create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_role'
      and n.nspname = 'public'
  ) then
    create type public.user_role as enum ('customer', 'admin', 'super_admin');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  email text,
  role public.user_role not null default 'customer',
  preferences text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  recipient_name text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  country text not null default 'Nigeria',
  postal_code text,
  delivery_notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);

create unique index if not exists addresses_one_default_per_user_idx
  on public.addresses(user_id)
  where is_default = true;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can read own addresses" on public.addresses;
create policy "Users can read own addresses"
  on public.addresses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own addresses" on public.addresses;
create policy "Users can create own addresses"
  on public.addresses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own addresses" on public.addresses;
create policy "Users can update own addresses"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own addresses" on public.addresses;
create policy "Users can delete own addresses"
  on public.addresses for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
as '
begin
  new.updated_at = now();
  return new;
end;
'
language plpgsql;

create or replace function public.prevent_profile_role_client_update()
returns trigger
as '
begin
  if old.role is distinct from new.role
    and auth.uid() is not null
    and coalesce(auth.role(), '''') <> ''service_role'' then
    raise exception ''Profile roles can only be changed by privileged server-side operations.'';
  end if;

  return new;
end;
'
language plpgsql
security definer
set search_path = public;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_prevent_role_client_update on public.profiles;
create trigger profiles_prevent_role_client_update
  before update on public.profiles
  for each row execute function public.prevent_profile_role_client_update();

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
as '
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    phone,
    email,
    role
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> ''first_name'', ''''),
    nullif(new.raw_user_meta_data ->> ''last_name'', ''''),
    nullif(new.raw_user_meta_data ->> ''phone'', ''''),
    new.email,
    ''customer''
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    email = excluded.email;

  return new;
end;
'
language plpgsql
security definer
set search_path = public;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();
