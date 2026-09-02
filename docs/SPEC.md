# THIKA ROAD CHAMA GROUP — COMPLETE SPECIFICATION
*Version: Full Day Discussion Consolidated - 29 Aug 2026*

This is the locked, source-of-truth spec. If code or checklist docs
ever disagree with this file, this file wins.

## A. PROJECT OVERVIEW
- Chama Name: Thika Road Chama Group
- Location: Thika Road, Nairobi
- Members: 15 members, one Chairman (Maina), one Treasurer
- Bank: Paybill Account — e.g. Equity Bank Paybill 247247, Account
  THIKA_ROAD (bank owns the Paybill, not Safaricom)
- Money: Weekly contribution KES 2500 (2000 savings + 500 welfare,
  no reserves/fines pot in normal pay)
- Deadline: Every Thursday 12:00 PM noon EAT sharp
- Fine: KES 400 auto-added if not paid by Thu 12pm + SMS notice
- Priority order: Fine → weekly 2500 → loan
- Payment mode: READING via Safaricom Daraja C2B API. No STK push.
  Member pays manually via M-Pesa Paybill; we read the confirmation.
  Daraja is free, no monthly cost.

## B. ALLOCATION LOGIC (locked)
- No loan: 5000 paid = 2500 current week + 2500 overdue/advance
- Loan 7000, pays 5000: 2500 → weekly (2000 savings + 500 welfare)
  first, remaining 2500 → loan (7000-2500=4500 left)
- Fine 400 + weekly + loan: 5400 = 400 fine + 2500 weekly + 2500 loan
- Identification: by phone (MSISDN) + loan_balance lookup, NOT
  BillRef (members forget to type it). BillRef suffix
  THIKA_ROAD-FINE / -LOAN is an optional fallback only.

## C. REGISTRATION FLOW
1. Register: full_name, email, phone (07 format), national_id,
   password, confirm password → supabase.auth.signUp() → insert
   profiles with status PENDING_EMAIL
2. Verify Email: Supabase sends 6-digit code via email (not link).
   6 boxes, auto-focus, 60s timer, resend, back to register
3. Waiting for Chairman: status PENDING_APPROVAL, yellow badge,
   illustration, "waiting for Chairman Maina to approve", Back to
   Login button. Login while PENDING_APPROVAL force-redirects here.
4. Chairman Admin → Pending Invites (2): name/email/phone/id/date,
   Approve/Reject with reason. Approve → status ACTIVE, welcome
   email (SendGrid) + SMS.
5. Login: email+password. Status check routes: PENDING_EMAIL→Verify,
   PENDING_APPROVAL→Waiting, ACTIVE→Dashboard.

## D. 17 SCREENS
1. Register
2. Verify Email (6-digit)
3. Waiting for Chairman Approval
4. Login
5. Dashboard — Total Savings, My Fines, Welfare, Group Savings,
   Thursday countdown, Pay Now, Recent Transactions, Overdue
   Members (chairman)
6. Members — list 15, avatar, paid/pending, search, filter, tap
   profile (read-only member, editable chairman)
7. Contribute Now — READING MODE, no STK. Paybill/Account
   instructions, Copy buttons, linked phone, realtime poll status
   every 5s via Supabase Realtime, last payment, fine/loan banners
8. Success Receipt — auto pops on Daraja confirmation (realtime),
   TransID, amount, waterfall breakdown, share/email, generates PDF
9. Loans — balance, Request New Loan (amount/reason/guarantor/
   collateral/interest set by chairman), schedule, history
10. Profile — avatar, name/phone editable, email/ID locked+verified
    badge, role badge, change password, logout
11. Edit Profile — name/phone/avatar only
12. My Receipts — list, search, filter by type, total, view
    breakdown, email receipt (SendGrid), download all (PDF/Excel/
    CSV via Edge Function + jsPDF/exceljs). Chairman sees all
    (RLS), member sees own only.
13. Manage Members (Chairman) — active list, search/filter,
    Pending Invites badge, View/Remove/Verify ID, Add Member, stats
14. Pending Approvals (Chairman) — approve/reject new members
15. Approve Loans (Chairman) — pending list, guarantor, collateral,
    editable interest, approve/reject+comment, updates balance +
    loan_audit
16. Treasurer Dashboard — Total Collected Today, Weekly totals,
    collections (auto/read-only), pending verifications (0, auto),
    bank reconciliation export, overdue members, fines collected
17. Waterfall Settings (Treasurer) — Savings 80%=2000 / Welfare
    20%=500 sliders (must sum 100%), fine 400 separate note, loan
    after weekly, Auto Allocation toggle ON, preview 2500 and 5000
    splits, Save to settings table

Bottom nav (all roles): Dashboard | Members | Contribute | Loans |
Profile.

## E. THURSDAY 12PM DEADLINE & FINE SYSTEM
- pg_cron Job 1 @ Thu 12:00:00 EAT: contributions where
  week=current AND amount>=2500. Not found → insert fines row
  (amount 400, reason "Missed Thu 12pm deadline {date}", unpaid,
  balance 400)
- Job 2 @ 12:05 same day: Edge Function send-fine-sms loops fined
  members, Africa's Talking SMS with fine + new total owed
- Frontend: dashboard countdown, red overdue banner from Friday

## F. DARAJA C2B READING — COST & STEPS
Cost: free to developer, no monthly fee. Safaricom charges member
~22 KES M-Pesa fee; bank charges client ~0.5% Paybill fee already
being paid. Developer pays zero.
1. Get from client: bank name, Paybill number, account name,
   confirm Paybill ownership (chama or bank)
2. Register developer.safaricom.co.ke with chairman email
3. Create app, enable C2B API, get Consumer Key/Secret
4. Deploy validation + confirmation Edge Functions
5. Register URLs in Daraja (validation, confirmation), shortcode =
   Paybill number, Response Type = Completed
6. Test with Daraja C2B Simulator
7. Go live: submit KYC (chama cert, chairman ID, KRA PIN), 24-48h
   approval
8. If bank owns Paybill: ask bank to enable C2B forwarding
   (Equity/Co-op support this) or fall back to a bank API pull

## G. SECURITY & FAILURE MODES
Failures:
1. Safaricom down (1-2x/yr) → confirmation delayed 5-15 min, not
   lost. Safaricom retries 3x. TransID idempotency prevents double-
   counting. Money stays safe in the bank; member's M-Pesa SMS is
   proof if treasurer needs to manually confirm.
2. Supabase down → Safaricom retries webhook up to 24h, failed
   attempts logged to failed_webhooks, cron retries hourly.
3. Wrong account name typed → Validation URL returns ResultCode 1
   (Invalid Account), Safaricom reverses instantly, money never
   leaves M-Pesa.

Security layers:
- RLS: profiles role-gated. loans: members SELECT own only, UPDATE
  only chairman/treasurer, DELETE always false. contributions:
  INSERT false for clients (service_role Edge Function only).
  loan_audit: no UPDATE/DELETE policy, ever.
- Audit trail: every loan change → loan_audit (old_balance,
  new_balance, changed_by, mpesa_code, ip_address, timestamp,
  reason). Not even chairman can delete these rows.
- Code: loan amounts live in DB (encrypted at rest via Supabase),
  never hardcoded. JWTs expire 1h. 2FA for chairman/treasurer. PIN
  required for any loan edit > 1000.
- Bank as final boss: even a compromised app can't fake money —
  monthly reconciliation (Export Excel) diffs app vs bank
  statement, mismatches flagged red. Daily PDF backup emailed to
  chairman.

Message to give the client: "Money lives in the Bank, not the app.
The app is a mirror reading Safaricom. If the app fails, money is
safe. If the app is hacked, the bank statement exposes it."

## H. DATABASE SCHEMA (full)
```
profiles(id uuid FK auth.users, email text unique, phone text unique 254-format,
  full_name text, national_id text unique, role text chairman/treasurer/member,
  status text PENDING_EMAIL/PENDING_APPROVAL/ACTIVE, avatar_url text, created_at timestamp)

contributions(id uuid, member_id uuid FK profiles, amount numeric, savings numeric 2000,
  welfare numeric 500, mpesa_code text unique, week int, type text WEEKLY/OVERDUE_OR_ADVANCE,
  created_at)

fines(id uuid, member_id uuid, amount numeric 400, balance numeric, reason text,
  status text paid/unpaid, created_at)

loans(id uuid, member_id uuid, amount numeric, balance numeric, interest numeric,
  reason text, guarantor uuid FK profiles, collateral text,
  status text PENDING/APPROVED/REJECTED/PAID, created_at)

transactions(id uuid, member_id uuid, type text WEEKLY/FINE/LOAN_REPAYMENT/OVERDUE,
  amount numeric, mpesa_code text, created_by text system-or-email, created_at)

loan_audit(id uuid, loan_id uuid, old_balance numeric, new_balance numeric,
  changed_by text, changed_at timestamp, mpesa_code text, ip_address text, reason text)

failed_webhooks(id uuid, payload jsonb, error text, retry_count int, created_at)

credits(id uuid, member_id uuid, amount numeric "leftover <2500", mpesa_code text)

settings(id uuid, savings_percent int 80, welfare_percent int 20, fine_amount int 400,
  weekly_amount int 2500, auto_allocation bool true)
```
(Migrations for tables beyond `profiles` will be added table-by-table
as each build step needs them — see `docs/BUILD_ORDER.md`.)

## I. EDGE FUNCTIONS NEEDED
mpesa-validation, mpesa-confirmation (allocation: Fine → Weekly 2500
→ Loan → Overdue), send-fine-sms, generate-receipt-pdf,
export-all-receipts, daily-backup

## J. ENV VARS
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      (Edge Functions only, never in app)
DARAJA_CONSUMER_KEY
DARAJA_CONSUMER_SECRET
DARAJA_SHORTCODE=247247
AT_USERNAME
AT_API_KEY
SENDGRID_API_KEY
CHAIRMAN_EMAIL
TREASURER_EMAIL
```

## K. BUILD ORDER (11 steps — tracked live in docs/BUILD_ORDER.md)
1. Init Expo + Supabase
2. Auth screens (Register/Verify/Waiting/Login) + profiles + RLS
3. Dashboard + Members (read-only)
4. Edge Functions mpesa-validation/mpesa-confirmation + simulator
   test + allocation
5. Contribute (reading mode, polling)
6. Thursday 12pm cron + fine SMS
7. Loans + Approve Loans + loan_audit
8. Profile + Edit + Receipts + Email export
9. Chairman: Manage Members + Pending Approvals
10. Treasurer Dashboard + Waterfall Settings (2000/500, Auto ON)
11. Security: RLS review, audit, daily backup
