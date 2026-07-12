create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number serial not null,
  user_id uuid references auth.users(id) on delete set null, -- Nullable for guest checkouts
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null,
  shipping_country text not null default 'Nigeria',
  subtotal_amount numeric not null check (subtotal_amount >= 0),
  delivery_amount numeric not null check (delivery_amount >= 0),
  total_amount numeric not null check (total_amount >= 0),
  payment_status text not null default 'pending', -- 'pending', 'paid', 'failed'
  status text not null default 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price numeric not null check (price >= 0),
  selected_color text,
  selected_size text,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- Enable RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies for orders
drop policy if exists "Anyone can insert orders" on public.orders;
create policy "Anyone can insert orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
  on public.orders for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
  on public.orders for delete
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

-- Policies for order items
drop policy if exists "Anyone can insert order items" on public.order_items;
create policy "Anyone can insert order items"
  on public.order_items for insert
  with check (true);

drop policy if exists "Users can read own order items" on public.order_items;
create policy "Users can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_id
        and (
          orders.user_id = auth.uid()
          or exists (
            select 1
            from public.profiles
            where profiles.id = auth.uid()
              and profiles.role in ('admin', 'super_admin')
          )
        )
    )
  );
