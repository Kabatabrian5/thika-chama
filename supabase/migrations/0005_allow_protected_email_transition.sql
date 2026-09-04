-- ============================================================
-- MIGRATION 0005: allow the protected email transition
-- ============================================================
-- Migration 0003 uses a transaction-local marker so the member's
-- email verification RPC can perform its one allowed status change.
-- This updates the already-installed trigger function in projects
-- where migration 0001 has already been applied.
-- ============================================================

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

    if not exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('chairman', 'treasurer')
    ) then
      raise exception 'Only chairman or treasurer may change role or status';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;