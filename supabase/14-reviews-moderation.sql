-- Ensure public.reviews table has all necessary columns for moderation and customer details
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  customer_name text not null default 'Verified Customer',
  customer_email text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  status text not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add columns if table already existed from earlier schema
alter table public.reviews add column if not exists customer_name text not null default 'Verified Customer';
alter table public.reviews add column if not exists customer_email text;
alter table public.reviews add column if not exists status text not null default 'Pending';
alter table public.reviews add column if not exists updated_at timestamptz not null default now();

-- Indexes for performance
create index if not exists reviews_product_id_idx on public.reviews(product_id);
create index if not exists reviews_status_idx on public.reviews(status);
create index if not exists reviews_user_id_idx on public.reviews(user_id);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies for reviews
drop policy if exists "Anyone can read approved reviews" on public.reviews;
create policy "Anyone can read approved reviews"
  on public.reviews for select
  using (status = 'Approved');

drop policy if exists "Users can submit reviews" on public.reviews;
create policy "Users can submit reviews"
  on public.reviews for insert
  with check (true);

drop policy if exists "Admins can manage all reviews" on public.reviews;
create policy "Admins can manage all reviews"
  on public.reviews for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
    )
  );
