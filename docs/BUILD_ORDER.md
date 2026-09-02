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

- [ ] **Step 3: Dashboard + Members (read-only)**
  Bottom tab nav: Dashboard | Members | Contribute | Loans | Profile.
  Dashboard cards: Total Savings, My Fines, Welfare, Group Savings
  (chairman), Thursday countdown, Pay Now, Recent Transactions,
  Overdue Members (chairman only). Members list with paid/pending
  status, search, filter.

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
