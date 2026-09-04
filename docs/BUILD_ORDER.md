# Build Order & Status

This is the master checklist. **Update the checkbox and the
"Status notes" line under a step every time work on it finishes**,
so anyone (human or AI) picking up this repo cold can see exactly
where things stand in under a minute.

- [x] **Step 1-2: Project scaffold + Supabase wiring + Auth screens**
  Status notes (2026-09-02): Expo TS app scaffolded, devcontainer
  added for Codespaces, Supabase client + RLS-protected `profiles`
  table created. All 4 auth screens built and typechecked clean:
  Register, VerifyEmail (6-digit), WaitingApproval, Login. Routing
  logic (PENDING_EMAIL/PENDING_APPROVAL/ACTIVE/REJECTED) lives in
  `RootNavigator.tsx` + `LoginScreen.tsx`. A `DashboardPlaceholder`
  stands in for the real dashboard so the flow is testable end to
  end right now — **delete it in Step 3**.
  Not yet done: actually creating the Supabase project + running
  the SQL migration (see `docs/SUPABASE_SETUP.md`) — that's a
  manual step for you to do with your own Supabase account, since
  it needs your credentials.

- [x] **Step 3: Dashboard + Members (read-only)**
  Bottom tab nav: Dashboard | Members | Contribute | Loans | Profile.
  Dashboard cards: Total Savings, My Fines, Welfare, Group Savings
  (chairman), Thursday countdown, Pay Now, Recent Transactions,
  Overdue Members (chairman only). Members list with paid/pending
  status, search, filter.
  Status notes (2026-09-02): Added the bottom-tab navigation contract,
  live profile-backed Dashboard screen, and read-only Members directory
  with name search. Financial totals remain clearly pending until the
  contributions migration is implemented in Step 4-5.

  Follow-up (2026-09-03): Added the branded signed-out opening screen
  with a community handshake visual and Login/Register entry points.
  Also refined the Login screen to match the supplied mobile reference
  while preserving the existing authentication and status routing logic.
  Registration profile creation now runs through an Auth trigger in
  migration `0002_profile_signup_trigger.sql`, so email-confirmed signup
  can create `profiles` before a client session exists.

  Follow-up (2026-09-04): Confirmed the Supabase Email provider settings
  are `Email OTP length = 6` digits and `Email OTP expiration = 600`
  seconds. The Confirm signup template must use `{{ .Token }}`. Gmail
  SMTP is acceptable for development without a custom domain; the next
  check is live delivery to a Gmail inbox before Step 4 begins.

  Follow-up (2026-09-04): Removed the client-side profile insert from
  registration because email-confirmed signup has no authenticated session
  and RLS rejects it. Migration `0002_profile_signup_trigger.sql` creates
  the profile server-side; `RegisterScreen.tsx` now proceeds to Verify Email.

  Follow-up (2026-09-04): Added visible inline errors for wrong/expired OTPs
  and stabilized the successful verification route by signing out the pending
  session before showing WaitingApproval.

  Follow-up (2026-09-04): Live signup testing confirmed Supabase accepted the
  registration and Gmail received the six-digit OTP. One fresh successful-code
  test remains before Step 4; the wrong-code feedback fix is already applied.

  Follow-up (2026-09-04): Clarified the resend cooldown and added visible
  resend success/error feedback so a new Gmail request no longer appears to
  do nothing on Expo web.

  Follow-up (2026-09-04): Resend now identifies Supabase rate-limit
  responses, applies the retry cooldown after a throttled request, and
  explains that Gmail spam/Promotions should be checked. Supabase limits
  signup confirmation requests to one every 60 seconds; its default email
  service also allows only two auth emails per hour. Custom SMTP remains
  the delivery fix for repeated development testing.

  Follow-up (2026-09-04): Replaced the signed-out text welcome route with
  a wordless animated app splash. It shows the app logo and loading
  indicator, then opens Login automatically after 1.4 seconds.

  Follow-up (2026-09-04): Added visible registration and login errors for
  web, input limits of 19 phone digits and 8 ID digits, duplicate-account
  guidance to log in, and stale confirmed-profile recovery. Refined the
  visual treatment of both auth forms.

  Follow-up (2026-09-04): Fixed the post-OTP status error by moving the
  member's allowed `PENDING_EMAIL` to `PENDING_APPROVAL` transition into
  protected RPC `complete_email_verification`. Migration 0003 must be run
  in Supabase before the live flow can use the repair.

  Follow-up (2026-09-04): Added protected chairman/treasurer member
  management through `manage_member`, with approve, reject, and remove
  actions in the Members table. Use a one-time SQL bootstrap to promote
  the development owner account before testing these controls.

  Follow-up (2026-09-04): Refined the post-verification WaitingApproval
  screen to match the supplied mobile reference and pass the verified email
  into the confirmation message.

  Follow-up (2026-09-04): Added inline success/error feedback for chairman
  member actions and migration 0006 to harden the management RPC role check.

- [ ] **Step 4: Edge Functions — mpesa-validation, mpesa-confirmation**
  Daraja C2B webhook handlers. Allocation logic: Fine → Weekly
  (2000 savings + 500 welfare) → Loan → Overdue/Advance. Test via
  Daraja C2B Simulator before going live.

- [ ] **Step 5: Contribute screen (reading mode)**
  Static Paybill/Account instructions + Copy buttons, realtime
  polling of `contributions` table via Supabase Realtime, Success
  Receipt screen with PDF generation.

- [ ] **Step 6: Thursday 12pm cron + fine SMS**
  `pg_cron` job to insert fines at the deadline, Edge Function
  `send-fine-sms` via Africa's Talking.

- [ ] **Step 7: Loans**
  Request Loan form, Approve Loans (chairman), `loan_audit` table
  with no update/delete policy ever.

- [ ] **Step 8: Profile, Edit Profile, My Receipts (email/export)**

- [ ] **Step 9: Chairman — Manage Members, Pending Approvals**

- [ ] **Step 10: Treasurer Dashboard + Waterfall Settings**
  Savings 80% / Welfare 20% sliders, Auto Allocation toggle.

- [ ] **Step 11: Security hardening pass**
  Full RLS review across every table, audit logging review, daily
  backup Edge Function, 2FA for chairman/treasurer, PIN for loan
  edits > 1000.

## Source of truth
The full locked spec (every number, every screen, every rule) is
in `docs/SPEC.md` — copied verbatim from the original planning doc.
If anything in this checklist or the code ever seems to disagree
with `SPEC.md`, `SPEC.md` wins; flag the conflict and fix the code,
don't quietly reinterpret the spec.
