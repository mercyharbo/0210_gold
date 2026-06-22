create or replace function public.set_updated_at()
returns trigger
as '
begin
  new.updated_at = now();
  return new;
end;
'
language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
as '
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    phone,
    email
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> ''first_name'', ''''),
    nullif(new.raw_user_meta_data ->> ''last_name'', ''''),
    nullif(new.raw_user_meta_data ->> ''phone'', ''''),
    new.email
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
