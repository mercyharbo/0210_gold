insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Anyone can read product media" on storage.objects;
create policy "Anyone can read product media"
  on storage.objects for select
  using (bucket_id = 'product-media');

drop policy if exists "Admins can upload product media" on storage.objects;
create policy "Admins can upload product media"
  on storage.objects for insert
  with check (
    bucket_id = 'product-media'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can update product media" on storage.objects;
create policy "Admins can update product media"
  on storage.objects for update
  using (
    bucket_id = 'product-media'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  )
  with check (
    bucket_id = 'product-media'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can delete product media" on storage.objects;
create policy "Admins can delete product media"
  on storage.objects for delete
  using (
    bucket_id = 'product-media'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'super_admin')
    )
  );
