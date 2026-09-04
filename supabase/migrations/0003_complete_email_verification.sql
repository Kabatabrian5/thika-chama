-- ============================================================
-- MIGRATION 0003: complete email verification safely
-- ============================================================
-- Email verification is the one status transition a member must
-- complete themselves. Keep the role/status protection in place,
-- and expose only this narrowly scoped server-side operation.
-- ============================================================

create or replace function public.complete_email_verification()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to complete email verification';
  end if;

  perform set_config('app.email_verification', 'true', true);

  update public.profiles
  set status = 'PENDING_APPROVAL'
  where id = auth.uid()
    and status = 'PENDING_EMAIL';

  if not found then
    raise exception 'Profile is not awaiting email verification';
  end if;
end;
$$;

revoke all on function public.complete_email_verification() from public;
grant execute on function public.complete_email_verification() to authenticated;