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
