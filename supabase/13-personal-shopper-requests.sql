-- Migration: Create personal_shopper_requests table and policies
create table if not exists public.personal_shopper_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text not null,
  category text not null,
  budget text,
  size text,
  preferred_stores_or_links text,
  delivery_city text,
  message text not null,
  status text not null default 'Pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists personal_shopper_requests_user_id_idx on public.personal_shopper_requests(user_id);
create index if not exists personal_shopper_requests_status_idx on public.personal_shopper_requests(status);
create index if not exists personal_shopper_requests_created_at_idx on public.personal_shopper_requests(created_at desc);

-- Enable RLS
alter table public.personal_shopper_requests enable row level security;

-- Policies for personal shopper requests
drop policy if exists "Anyone can create personal shopper requests" on public.personal_shopper_requests;
create policy "Anyone can create personal shopper requests"
  on public.personal_shopper_requests for insert
  with check (true);

drop policy if exists "Users can view own personal shopper requests" on public.personal_shopper_requests;
create policy "Users can view own personal shopper requests"
  on public.personal_shopper_requests for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can view all personal shopper requests" on public.personal_shopper_requests;
create policy "Admins can view all personal shopper requests"
  on public.personal_shopper_requests for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can update all personal shopper requests" on public.personal_shopper_requests;
create policy "Admins can update all personal shopper requests"
  on public.personal_shopper_requests for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );
