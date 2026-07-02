create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_src text,
  image_alt text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_category_preferences (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, category_id)
);

create index if not exists categories_parent_id_idx
  on public.categories(parent_id);

create index if not exists categories_is_active_sort_order_idx
  on public.categories(is_active, sort_order);

create index if not exists profile_category_preferences_category_id_idx
  on public.profile_category_preferences(category_id);

alter table public.categories enable row level security;
alter table public.profile_category_preferences enable row level security;

drop policy if exists "Anyone can read active categories" on public.categories;
create policy "Anyone can read active categories"
  on public.categories for select
  using (is_active = true);

drop policy if exists "Users can read own category preferences" on public.profile_category_preferences;
create policy "Users can read own category preferences"
  on public.profile_category_preferences for select
  using (auth.uid() = profile_id);

drop policy if exists "Users can create own category preferences" on public.profile_category_preferences;
create policy "Users can create own category preferences"
  on public.profile_category_preferences for insert
  with check (auth.uid() = profile_id);

drop policy if exists "Users can delete own category preferences" on public.profile_category_preferences;
create policy "Users can delete own category preferences"
  on public.profile_category_preferences for delete
  using (auth.uid() = profile_id);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

insert into public.categories (name, slug, description, image_src, image_alt, sort_order)
values
  ('Jewellery & Accessories', 'jewellery-accessories', 'Gold pieces, finishing details, and styling accents.', '/images/featured-collections/jewellery-accessories.png', 'Gold jewellery and accessories styled as a premium flat lay', 10),
  ('Abaya', 'abaya', 'Elegant modest silhouettes for everyday dressing and occasions.', '/images/featured-collections/abaya.png', 'Elegant abaya garment styled in a boutique studio', 20),
  ('Clothing', 'clothing', 'Wardrobe pieces across dresses, tops, bottoms, co-ords, and sets.', '/images/featured-collections/clothing.png', 'Curated fashion clothing arranged in a clean boutique scene', 30),
  ('Bags', 'bags', 'Structured bags, evening bags, and outfit-finishing styles.', '/images/featured-collections/bags.png', 'Elegant bags styled on a warm studio plinth', 40),
  ('Shoes', 'shoes', 'Heels, flats, sandals, sneakers, and polished footwear.', '/images/featured-collections/shoes.png', 'Elegant shoes arranged on minimal studio plinths', 50),
  ('Modest Sets', 'modest-sets', 'Coordinated outfit sets for easy styling.', '/images/featured-collections/modest-sets.png', 'Coordinated modest fashion outfit styled in a boutique studio', 60),
  ('Dresses', 'dresses', 'Dresses for everyday, occasion, and styled looks.', null, null, 110),
  ('Tops', 'tops', 'Tops, blouses, shirts, and longline styles.', null, null, 120),
  ('Skirts', 'skirts', 'Mini, midi, maxi, and modest skirt styles.', null, null, 130),
  ('Trousers', 'trousers', 'Trousers, jeans, tailored bottoms, and casual bottoms.', null, null, 140),
  ('Co-ords', 'co-ords', 'Two-piece and coordinated outfit options.', null, null, 150),
  ('Outerwear', 'outerwear', 'Blazers, jackets, and layering pieces.', null, null, 160),
  ('Kaftans', 'kaftans', 'Kaftans and relaxed modest silhouettes.', null, null, 210),
  ('Hijabs & Scarves', 'hijabs-scarves', 'Hijabs, scarves, and styling wraps.', null, null, 220),
  ('Handbags', 'handbags', 'Handbags, shoulder bags, crossbody bags, and totes.', null, null, 310),
  ('Evening Bags', 'evening-bags', 'Clutches, mini bags, and occasion bags.', null, null, 320),
  ('Heels', 'heels', 'Heels and occasion footwear.', null, null, 410),
  ('Flats & Sandals', 'flats-sandals', 'Flats, sandals, slides, and easy footwear.', null, null, 420),
  ('Gold Jewellery', 'gold-jewellery', 'Gold jewellery pieces and styling sets.', null, null, 510),
  ('Rings', 'rings', 'Rings and hand jewellery.', null, null, 520),
  ('Necklaces', 'necklaces', 'Necklaces, chains, pendants, and layered pieces.', null, null, 530),
  ('Earrings', 'earrings', 'Earrings and finishing jewellery.', null, null, 540),
  ('Wedding Guest', 'wedding-guest', 'Looks and accessories for wedding guest styling.', null, null, 610),
  ('Workwear', 'workwear', 'Fashion pieces for work and polished weekday styling.', null, null, 620),
  ('Gift Ideas', 'gift-ideas', 'Gift-friendly fashion, gold, and accessories.', null, null, 630),
  ('Request-Based Picks', 'request-based-picks', 'Curated shopping request preferences.', null, null, 640)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_src = excluded.image_src,
  image_alt = excluded.image_alt,
  is_active = true,
  sort_order = excluded.sort_order;
