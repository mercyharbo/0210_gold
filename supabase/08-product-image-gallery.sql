alter table public.products
add column if not exists image_urls text[] not null default '{}';

update public.products
set image_urls = array[image_src]
where image_urls = '{}'
  and image_src is not null
  and image_src <> '';
