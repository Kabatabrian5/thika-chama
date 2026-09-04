-- ============================================================
-- MIGRATION 0004: protected chairman member management
-- ============================================================
-- The public app can request these actions, but only an existing
-- chairman or treasurer may execute them. Auth users are deleted
-- server-side so the service-role key never reaches the client.
-- ============================================================

create or replace function public.manage_member(target_user_id uuid, action text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_role public.profile_role;
begin
  select role into caller_role
  from public.profiles
  where id = auth.uid();

  if caller_role not in ('chairman', 'treasurer') then
    raise exception 'Only chairman or treasurer may manage members';
  end if;

  if action = 'delete' then
    if target_user_id = auth.uid() then
      raise exception 'You cannot remove your own account';
    end if;
    delete from auth.users where id = target_user_id;
    if not found then
      raise exception 'Member account was not found';
    end if;
  elsif action = 'approve' then
    update public.profiles set status = 'ACTIVE'
    where id = target_user_id and status = 'PENDING_APPROVAL';
    if not found then
      raise exception 'Member is not awaiting approval';
    end if;
  elsif action = 'reject' then
    update public.profiles set status = 'REJECTED'
    where id = target_user_id and status = 'PENDING_APPROVAL';
    if not found then
      raise exception 'Member is not awaiting approval';
    end if;
  else
    raise exception 'Unsupported member action';
  end if;
end;
$$;

revoke all on function public.manage_member(uuid, text) from public;
grant execute on function public.manage_member(uuid, text) to authenticated;