-- ============================================================
-- MIGRATION 0007: private profile avatar storage
-- ============================================================
-- Avatars are private member data. Each member can manage only
-- objects inside the folder named with their own auth user ID.
-- The app stores the object path in profiles.avatar_url and uses
-- short-lived signed URLs when displaying it.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do update set public = false;

create policy "Members can view their own avatar"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Members can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Members can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Members can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );