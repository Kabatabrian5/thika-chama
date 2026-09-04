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
- Open the template's **Source** editor and replace the body so it
  uses `{{ .Token }}` (the 6-digit code) instead of
  `{{ .ConfirmationURL }}` (the magic link). For example:

  ```html
  <h2>Confirm your email address</h2>
  <p>Your Thika Road Chama verification code is:</p>
  <h1>{{ .Token }}</h1>
  <p>This code expires in 10 minutes.</p>
  ```
- Do the same for **Magic Link** template if you ever add
  passwordless login later — not needed for now.

## 4. Confirm email OTP expiry
- Authentication → Providers → Email → set **Email OTP expiration**
  to `600` seconds and **Email OTP length** to `6` digits.
- These fields are in the Email provider settings, not in Email Templates.

## 5. Configure email delivery for development
- A custom app domain is not required to receive the code at a Gmail address.
- For small-scale development testing, Authentication → SMTP Settings can use
  `smtp.gmail.com` on port `587` with the Gmail address and a Gmail App Password.
- Supabase may warn that Gmail is intended for personal rather than
  transactional email. This is acceptable for development testing, but use a
  transactional provider for production to improve delivery and avoid limits.
- Never use the normal Gmail password; create an App Password after enabling
  Google 2-Step Verification.

## 6. Turn OFF auto-confirm (if it's on)
- Authentication → Providers → Email → make sure **Confirm email**
  is required. If a Supabase project was created with email
  confirmation disabled, `signUp()` will immediately mark the user
  confirmed and VerifyEmailScreen will never be needed — which
  breaks our locked flow (Register → Verify → Waiting → Login).

## 7. RLS sanity check
- Table Editor → profiles → confirm "RLS enabled" shows green.
  If migration 0001 ran correctly this is automatic, but it's
  worth eyeballing once — a profiles table with RLS accidentally
  off would let any member read/edit anyone's role.

---
Once steps 1-7 are done, the Register → Verify Email → Waiting for
Approval → Login flow built in Step 1-2 is fully functional against
your real project.
