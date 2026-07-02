alter table public.categories
  add column if not exists category_type text not null default 'Fashion',
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_sort_order integer not null default 0;

create index if not exists categories_featured_sort_order_idx
  on public.categories(is_active, is_featured, featured_sort_order, sort_order);

drop policy if exists "Anyone can read active categories" on public.categories;
create policy "Anyone can read active categories"
  on public.categories for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Admins can read all categories" on public.categories;
create policy "Admins can read all categories"
  on public.categories for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
  on public.categories for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('admin', 'super_admin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('admin', 'super_admin')
    )
  );

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

insert into public.categories (
  name,
  slug,
  description,
  image_src,
  image_alt,
  category_type,
  is_active,
  is_featured,
  sort_order,
  featured_sort_order
)
values
  (
    'Jewellery & Accessories',
    'jewellery-accessories',
    'Gold pieces and finishing details grouped together for polished everyday styling.',
    '/images/featured-collections/jewellery-accessories.png',
    'Gold jewellery and accessories styled as a premium flat lay',
    'Gold',
    true,
    true,
    10,
    10
  ),
  (
    'Abaya',
    'abaya',
    'Elegant modest silhouettes with refined fabrics for dressy and everyday looks.',
    '/images/featured-collections/abaya.png',
    'Elegant abaya garment styled in a boutique studio',
    'Fashion',
    true,
    true,
    20,
    20
  ),
  (
    'Clothing',
    'clothing',
    'Curated wardrobe pieces selected for clean lines, comfort, and easy styling.',
    '/images/featured-collections/clothing.png',
    'Curated fashion clothing arranged in a clean boutique scene',
    'Fashion',
    true,
    true,
    30,
    30
  ),
  (
    'Bags',
    'bags',
    'Structured bags and soft carry pieces to complete daily and occasion outfits.',
    '/images/featured-collections/bags.png',
    'Elegant bags styled on a warm studio plinth',
    'Accessories',
    true,
    true,
    40,
    40
  ),
  (
    'Shoes',
    'shoes',
    'Polished footwear options that balance comfort, shape, and occasion styling.',
    '/images/featured-collections/shoes.png',
    'Elegant shoes arranged on minimal studio plinths',
    'Fashion',
    true,
    true,
    50,
    50
  ),
  (
    'Modest Sets',
    'modest-sets',
    'Coordinated outfit sets designed for easy styling across casual and dressy days.',
    '/images/featured-collections/modest-sets.png',
    'Coordinated modest fashion outfit styled in a boutique studio',
    'Fashion',
    true,
    true,
    60,
    60
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_src = excluded.image_src,
  image_alt = excluded.image_alt,
  category_type = excluded.category_type,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  featured_sort_order = excluded.featured_sort_order;

insert into storage.buckets (id, name, public)
values ('category-media', 'category-media', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Anyone can read category media" on storage.objects;
create policy "Anyone can read category media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'category-media');

drop policy if exists "Admins can upload category media" on storage.objects;
create policy "Admins can upload category media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'category-media'
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can update category media" on storage.objects;
create policy "Admins can update category media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'category-media'
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('admin', 'super_admin')
    )
  )
  with check (
    bucket_id = 'category-media'
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can delete category media" on storage.objects;
create policy "Admins can delete category media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'category-media'
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('admin', 'super_admin')
    )
  );
