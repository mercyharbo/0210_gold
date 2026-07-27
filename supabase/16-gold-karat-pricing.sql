-- Migration 16: Add Gold Karat Pricing & Rate Settings

-- 1. Add gold per-gram rates to store_settings
alter table public.store_settings
  add column if not exists gold_rate_18k numeric not null default 133700,
  add column if not exists gold_rate_22k numeric not null default 163400,
  add column if not exists gold_rate_24k numeric not null default 178300,
  add column if not exists last_gold_rate_update timestamptz not null default now();

-- 2. Add gold weight, karat options, and making charge to products
alter table public.products
  add column if not exists gold_weight_grams numeric check (gold_weight_grams is null or gold_weight_grams >= 0),
  add column if not exists gold_karats text[] not null default '{}',
  add column if not exists making_charge numeric not null default 0 check (making_charge >= 0);

-- 3. Add selected_karat to order_items
alter table public.order_items
  add column if not exists selected_karat text;
