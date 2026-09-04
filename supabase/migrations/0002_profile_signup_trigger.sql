-- ============================================================
-- MIGRATION 0002: create profiles during email-confirmed signup
-- ============================================================
-- A signup that requires email confirmation has no authenticated
-- session yet, so the client cannot safely insert its own profile.
-- This server-side trigger creates the row from auth metadata.
-- ============================================================

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, full_name, national_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'national_id'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

-- Repair auth users created before this trigger was installed.
insert into public.profiles (id, email, phone, full_name, national_id)
select
  u.id,
  u.email,
  u.raw_user_meta_data ->> 'phone',
  u.raw_user_meta_data ->> 'full_name',
  u.raw_user_meta_data ->> 'national_id'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
and u.email is not null
and u.raw_user_meta_data ->> 'phone' is not null
and u.raw_user_meta_data ->> 'full_name' is not null
and u.raw_user_meta_data ->> 'national_id' is not null;