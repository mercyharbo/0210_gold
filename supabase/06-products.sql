do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'product_status'
      and n.nspname = 'public'
  ) then
    create type public.product_status as enum ('draft', 'active', 'archived');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'product_pricing_type'
      and n.nspname = 'public'
  ) then
    create type public.product_pricing_type as enum (
      'fixed',
      'starting_from',
      'price_on_request'
    );
  end if;
end $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid not null references public.categories(id) on delete restrict,
  pricing_type public.product_pricing_type not null default 'fixed',
  price integer,
  stock integer not null default 0,
  status public.product_status not null default 'draft',
  description text not null,
  image_src text not null,
  image_urls text[] not null default '{}',
  image_alt text not null,
  label text,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  details text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_matches_pricing_type_check check (
    (pricing_type = 'price_on_request' and price is null)
    or (pricing_type in ('fixed', 'starting_from') and price > 0)
  ),
  constraint products_stock_nonnegative_check check (stock >= 0),
  constraint products_slug_format_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index if not exists products_category_id_idx
  on public.products(category_id);

create index if not exists products_status_idx
  on public.products(status);

create index if not exists products_pricing_type_idx
  on public.products(pricing_type);

create index if not exists products_created_at_idx
  on public.products(created_at desc);

alter table public.products enable row level security;

drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products"
  on public.products for select
  using (status = 'active');

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
  on public.products for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();
