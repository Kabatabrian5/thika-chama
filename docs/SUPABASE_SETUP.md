# Supabase Setup Steps

One-time setup to do in the Supabase dashboard before the auth
flow will work. Do these in order.

## 1. Create the project
- Go to supabase.com → New Project
- Note the **Project URL** and **anon public key** (Settings → API)
  → put these in your `.env` as `EXPO_PUBLIC_SUPABASE_URL` /
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` (copy `.env.example` → `.env` first)

## 2. Run the migration
- SQL Editor → paste the contents of `supabase/migrations/0001_init_profiles.sql` → Run
- (Later migrations for contributions/loans/fines/etc will be added the same way as we build those steps)

## 3. Switch email verification to a 6-digit CODE, not a link
This is **not** the default. By default Supabase sends a magic link.
Our spec requires 6 boxes + a code, so:

- Dashboard → Authentication → Email Templates → **Confirm signup**
- Replace the template body so it uses `{{ .Token }}` (the 6-digit
  code) instead of `{{ .ConfirmationURL }}` (the magic link)
- Do the same for **Magic Link** template if you ever add
  passwordless login later — not needed for now.

## 4. Confirm email OTP expiry
- Authentication → Providers → Email → check **OTP Expiry** — the
  spec says the code should expire in ~10 minutes. Default is
  usually fine, but verify it matches what the email copy says.

## 5. Turn OFF auto-confirm (if it's on)
- Authentication → Providers → Email → make sure **Confirm email**
  is required. If a Supabase project was created with email
  confirmation disabled, `signUp()` will immediately mark the user
  confirmed and VerifyEmailScreen will never be needed — which
  breaks our locked flow (Register → Verify → Waiting → Login).

## 6. RLS sanity check
- Table Editor → profiles → confirm "RLS enabled" shows green.
  If migration 0001 ran correctly this is automatic, but it's
  worth eyeballing once — a profiles table with RLS accidentally
  off would let any member read/edit anyone's role.

---
Once steps 1-6 are done, the Register → Verify Email → Waiting for
Approval → Login flow built in Step 1-2 is fully functional against
your real project.
