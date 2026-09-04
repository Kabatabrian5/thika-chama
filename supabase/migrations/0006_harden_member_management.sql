-- ============================================================
-- MIGRATION 0006: harden member-management role checks
-- ============================================================
-- Keep the RPC fail-closed if the caller has no profile or role.
-- This forward migration updates projects where 0004 is installed.
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

  if caller_role is null or caller_role not in ('chairman', 'treasurer') then
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
    perform set_config('app.member_management', 'true', true);
    update public.profiles set status = 'ACTIVE'
    where id = target_user_id and status = 'PENDING_APPROVAL';
    if not found then
      raise exception 'Member is not awaiting approval';
    end if;
  elsif action = 'reject' then
    perform set_config('app.member_management', 'true', true);
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

-- The protected RPC has already verified the caller's role above. Allow its
-- status update through the profile protection trigger without allowing a
-- normal member to update their own status directly.
create or replace function public.prevent_self_role_escalation()
returns trigger as $$
begin
  if (new.role <> old.role or new.status <> old.status) then
    if current_setting('app.email_verification', true) = 'true'
      and new.role = old.role
      and old.status = 'PENDING_EMAIL'
      and new.status = 'PENDING_APPROVAL' then
      return new;
    end if;

    if current_setting('app.member_management', true) = 'true'
      and new.role = old.role
      and old.status = 'PENDING_APPROVAL'
      and new.status in ('ACTIVE', 'REJECTED') then
      return new;
    end if;

    if not exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('chairman', 'treasurer')
    ) then
      raise exception 'Only chairman or treasurer may change role or status';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;