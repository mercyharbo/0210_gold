create table if not exists public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_src text not null,
  route text not null default '/shop',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hero_banners enable row level security;

drop policy if exists "Anyone can read active hero banners" on public.hero_banners;
create policy "Anyone can read active hero banners"
  on public.hero_banners for select
  using (is_active = true);

drop policy if exists "Admins can manage hero banners" on public.hero_banners;
create policy "Admins can manage hero banners"
  on public.hero_banners for all
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

-- Create bucket
insert into storage.buckets (id, name, public)
values ('banner-media', 'banner-media', true)
on conflict (id) do update
set public = excluded.public;

-- Bucket policies
drop policy if exists "Anyone can read banner media" on storage.objects;
create policy "Anyone can read banner media"
  on storage.objects for select
  using (bucket_id = 'banner-media');

drop policy if exists "Admins can manage banner media" on storage.objects;
create policy "Admins can manage banner media"
  on storage.objects for all
  using (
    bucket_id = 'banner-media'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  )
  with check (
    bucket_id = 'banner-media'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

-- Trigger for updated_at
drop trigger if exists hero_banners_set_updated_at on public.hero_banners;
create trigger hero_banners_set_updated_at
  before update on public.hero_banners
  for each row execute function public.set_updated_at();
