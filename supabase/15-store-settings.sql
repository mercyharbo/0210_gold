-- Create store_settings table for system configurations
create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'FM Luxe Jewelry & Personal Shopping',
  support_email text not null default 'support@fmluxe.com',
  support_phone text not null default '+234 800 000 0000',
  store_address text default 'Victoria Island, Lagos, Nigeria',
  business_hours text default 'Mon - Sat: 9:00 AM - 6:00 PM',
  primary_currency text not null default 'NGN',
  gbp_rate numeric not null default 2200,
  usd_rate numeric not null default 1600,
  local_shipping_fee numeric not null default 5000,
  uk_shipping_rate_per_kg numeric not null default 15000,
  free_shipping_threshold numeric not null default 10000000,
  paystack_mode text not null default 'sandbox',
  order_email_notifications boolean not null default true,
  request_email_notifications boolean not null default true,
  low_stock_alerts boolean not null default true,
  session_expiry_days integer not null default 7,
  mfa_required boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.store_settings enable row level security;

-- Policies for store_settings
drop policy if exists "Anyone can read store settings" on public.store_settings;
create policy "Anyone can read store settings"
  on public.store_settings for select
  using (true);

drop policy if exists "Admins can manage store settings" on public.store_settings;
create policy "Admins can manage store settings"
  on public.store_settings for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
    )
  );

-- Insert default record if table is empty
insert into public.store_settings (id)
select '00000000-0000-0000-0000-000000000001'::uuid
where not exists (select 1 from public.store_settings);
