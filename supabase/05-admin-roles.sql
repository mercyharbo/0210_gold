do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_role'
      and n.nspname = 'public'
  ) then
    create type public.user_role as enum ('customer', 'admin', 'super_admin');
  end if;
end $$;

alter table public.profiles
  add column if not exists role public.user_role not null default 'customer';

update public.profiles
set role = 'customer'
where role is null;

create or replace function public.prevent_profile_role_client_update()
returns trigger
as '
begin
  if old.role is distinct from new.role
    and auth.uid() is not null
    and coalesce(auth.role(), '''') <> ''service_role'' then
    raise exception ''Profile roles can only be changed by privileged server-side operations.'';
  end if;

  return new;
end;
'
language plpgsql
security definer
set search_path = public;

drop trigger if exists profiles_prevent_role_client_update on public.profiles;
create trigger profiles_prevent_role_client_update
  before update on public.profiles
  for each row execute function public.prevent_profile_role_client_update();

create or replace function public.handle_new_user_profile()
returns trigger
as '
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    phone,
    email,
    role
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> ''first_name'', ''''),
    nullif(new.raw_user_meta_data ->> ''last_name'', ''''),
    nullif(new.raw_user_meta_data ->> ''phone'', ''''),
    new.email,
    ''customer''
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    email = excluded.email;

  return new;
end;
'
language plpgsql
security definer
set search_path = public;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Promote an existing user to admin by email:
-- update public.profiles
-- set role = 'admin'
-- where id = (
--   select id
--   from auth.users
--   where email = 'admin@example.com'
-- );

-- Promote an existing user to super admin by email:
-- update public.profiles
-- set role = 'super_admin'
-- where id = (
--   select id
--   from auth.users
--   where email = 'owner@example.com'
-- );
