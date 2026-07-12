create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint wishlists_user_product_unique unique (user_id, product_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists wishlists_user_id_idx on public.wishlists(user_id);
create index if not exists reviews_product_id_idx on public.reviews(product_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);

-- Enable RLS
alter table public.wishlists enable row level security;
alter table public.reviews enable row level security;

-- Policies for wishlists
drop policy if exists "Users can manage own wishlists" on public.wishlists;
create policy "Users can read own wishlists"
  on public.wishlists for select
  using (auth.uid() = user_id);

create policy "Users can insert own wishlists"
  on public.wishlists for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own wishlists"
  on public.wishlists for delete
  using (auth.uid() = user_id);

-- Policies for reviews
drop policy if exists "Anyone can read reviews" on public.reviews;
create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

drop policy if exists "Users can insert own reviews" on public.reviews;
create policy "Users can insert own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own reviews" on public.reviews;
create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);
