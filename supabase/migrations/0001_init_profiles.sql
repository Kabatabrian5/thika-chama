-- ============================================================
-- MIGRATION 0001: profiles table + RLS
-- ============================================================
-- Run this in the Supabase SQL editor, or via:
--   supabase db push
--
-- This is intentionally the FIRST migration because every other
-- table (contributions, loans, fines, etc.) has a foreign key
-- back to profiles.id.
-- ============================================================

-- Custom enum types keep status/role values consistent instead
-- of allowing any random string to be inserted.
create type profile_role as enum ('chairman', 'treasurer', 'member');
create type profile_status as enum (
  'PENDING_EMAIL',
  'PENDING_APPROVAL',
  'ACTIVE',
  'REJECTED'
);

create table profiles (
  -- Same id as auth.users.id — this is how we link a login
  -- session to a chama profile. ON DELETE CASCADE means if the
  -- auth user is ever deleted, their profile row goes with it.
  id uuid primary key references auth.users(id) on delete cascade,

  email text unique not null,
  phone text unique not null,          -- canonical 254XXXXXXXXX format, see src/lib/phone.ts
  full_name text not null,
  national_id text unique not null,

  role profile_role not null default 'member',
  status profile_status not null default 'PENDING_EMAIL',

  avatar_url text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security. Without this line, RLS policies
-- below are defined but NOT enforced — this line is what
-- actually turns protection on.
alter table profiles enable row level security;

-- ------------------------------------------------------------
-- POLICY: any authenticated member can read the group's
-- member list (needed for the Members screen, guarantor
-- picker on loan requests, etc). We do NOT allow anonymous
-- (logged-out) reads.
-- ------------------------------------------------------------
create policy "Authenticated users can view all profiles"
  on profiles for select
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- POLICY: a user can insert their OWN profile row only, and
-- only during registration (id must match their own auth uid).
-- This is what runs right after supabase.auth.signUp().
-- ------------------------------------------------------------
create policy "Users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- ------------------------------------------------------------
-- POLICY: a user can update their OWN profile (name, phone,
-- avatar) — but this does NOT let them change their own role
-- or status. We enforce that separately below with a trigger,
-- because RLS alone can't restrict which COLUMNS change.
-- ------------------------------------------------------------
create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- ------------------------------------------------------------
-- POLICY: chairman/treasurer can update ANY profile — this is
-- what powers "Approve" in Pending Invites (status change) and
-- "Verify ID" in Manage Members.
-- ------------------------------------------------------------
create policy "Chairman and treasurer can update any profile"
  on profiles for update
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('chairman', 'treasurer')
    )
  );

-- ------------------------------------------------------------
-- TRIGGER: prevent a plain member from promoting themselves to
-- chairman or approving their own account by editing role/status
-- via the "update own profile" policy above. Only chairman/
-- treasurer (checked here, not just relying on the policy) may
-- change role or status.
-- ------------------------------------------------------------
create or replace function prevent_self_role_escalation()
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

create trigger trg_prevent_self_role_escalation
  before update on profiles
  for each row
  execute function prevent_self_role_escalation();
