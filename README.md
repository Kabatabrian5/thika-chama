# Thika Road Chama Group

A React Native / Expo mobile app for a 15-member Nairobi chama. The app is built around the project spec and the actual contribution rules agreed with the client: weekly contribution is KES 2,500, split into KES 2,000 savings and KES 500 welfare, with the app reading M-Pesa Daraja C2B confirmations instead of pushing STK prompts.

This repository is intended to be easy to hand off to another AI or developer without requiring guesswork.

## GitHub repo status
This repository is now connected to the live GitHub repo:

https://github.com/Kabatabrian5/thika-chama

Use this remote in all handoff notes and deployment scripts. If you clone the repo fresh, run:

```bash
git clone https://github.com/Kabatabrian5/thika-chama.git
cd thika-chama
```

## Project purpose
- Chama name: Thika Road Chama Group
- Location: Thika Road, Nairobi
- Members: 15
- Roles: Chairman, Treasurer, Member
- Weekly contribution: KES 2,500
- Allocation: KES 2,000 savings + KES 500 welfare
- Deadline: every Thursday at 12:00 PM EAT
- Fine: KES 400 if missed by the deadline
- Payment model: Daraja C2B reading flow; no app-pushed STK
- Core rule: the app reads payment confirmations from M-Pesa and applies logic in the backend, not in the front-end alone

## Source of truth documentation
If you are picking this repo up fresh, read these files in this order:

1. `docs/SPEC.md` — locked project requirements and business rules
2. `docs/BUILD_ORDER.md` — implementation plan and current status
3. `docs/SUPABASE_SETUP.md` — Supabase setup and required dashboard steps
4. `docs/AI_HANDOFF.md` — this repo summary for future AI/developer handoff

## Current status
The app has a working foundation for the auth flow and navigation:

- Expo + React Native + TypeScript project scaffolded
- Supabase client configured
- Auth screens built: Register, Verify Email, Waiting for Chairman Approval, Login
- Root navigation checks session + profile status before showing dashboard access
- Dashboard and read-only Members directory are implemented as Step 3

The project is now at Step 3 of 11 and is not yet complete for the full chama workflow.

## Complete project progress

### Starting point

The project began as an Expo TypeScript mobile app for the 15-member Thika Road Chama Group in Nairobi. The agreed product rules were captured in `docs/SPEC.md` before implementation:

- KES 2,500 weekly contribution: KES 2,000 savings and KES 500 welfare
- Thursday 12:00 PM EAT payment deadline
- KES 400 automatic fine after a missed deadline
- Manual M-Pesa Paybill payments read through Daraja C2B
- No STK Push payments
- Bank records remain the final authority for money

### Completed Step 1-2: Project foundation and authentication

- Created the Expo SDK 57 React Native TypeScript project.
- Added the shared Supabase client with AsyncStorage session persistence.
- Added Kenyan phone normalization to the canonical `254XXXXXXXXX` format.
- Added the `profiles` table migration with roles, account statuses, timestamps, and RLS policies.
- Built the registration form with validation for name, email, phone, national ID, and password.
- Built the six-digit email verification screen with auto-focus, paste support, resend cooldown, and Supabase OTP verification.
- Built the chairman approval waiting screen.
- Built login with profile-status routing.
- Added strict status handling:
    - `PENDING_EMAIL` -> Verify Email
    - `PENDING_APPROVAL` -> Waiting for Chairman Approval
    - `ACTIVE` -> Main application
    - `REJECTED` -> remains outside the main application
- Added root navigation that checks the Supabase session and profile status before granting dashboard access.

### Completed Step 3: Dashboard and Members

- Replaced the temporary dashboard placeholder with the profile-backed Dashboard screen.
- Added the bottom-tab navigation contract: Dashboard, Members, Contribute, Loans, Profile.
- Added the Dashboard welcome state and Thursday contribution deadline information.
- Added clearly marked pending financial summary cards instead of inventing balances before the financial schema exists.
- Added the read-only Members directory with profile loading, alphabetical ordering, member count, and name search.
- Added a reading-mode Contribute screen locally with manual payment instructions, weekly allocation preview, linked-phone placeholder, polling-status placeholder, and fine/loan notice. It is still uncommitted and not yet connected to live payment records.
- Loans remains a temporary empty view until its build-order step is implemented.
- Profile is now wired locally with editable name/phone fields, locked email/national ID, role badge, save, logout, and a photo-upload placeholder.

### Deployment and phone testing preparation

- Connected the repository to `https://github.com/Kabatabrian5/thika-chama`.
- Configured Vercel to export the Expo web preview to `dist`.
- Added EAS Android development, preview, and production profiles.
- Linked the app to the Expo EAS project under the `briankabatas-team` account.
- Installed `expo-dev-client` for the development APK.
- Aligned the Expo slug with the linked EAS project (`chama`). The visible app name remains `thika-chama` and the Android package remains `com.kabatabrian5.thikachama`.
- Generated and stored the Android signing keystore through Expo.
- Submitted the Android development build to EAS. The build spent approximately one hour in the free queue and then failed during the Android build, so no APK download link was produced. Build page: https://expo.dev/accounts/briankabatas-team/projects/chama/builds/d196355f-b9b4-4920-a691-8048fb05a602. It is a test/development build, not the final production release.

### Verification completed

- `node_modules/.bin/tsc.cmd --noEmit` passed.
- `npm run build` passed and exported the web app to `dist`.
- EAS accepted the Android build upload and created a build page. The latest corrected development build finished successfully and produced an APK.
- APK download: https://expo.dev/artifacts/eas/rkq895el6GPVAPGkz74iYQbm2Zp_5YZFdZYsTL2FbwA.apk

### Not yet completed

The following work has not been implemented yet:

- Contributions, fines, transactions, loans, receipts, credits, settings, and audit-table migrations
- Daraja validation and confirmation Edge Functions
- Payment allocation waterfall and idempotency handling
- Reading-mode Contribute screen and realtime payment receipt flow
- Thursday deadline cron and fine SMS notifications
- Loan requests, chairman loan approvals, and immutable loan audit records
- Profile editing, receipt exports, chairman administration, and treasurer tools
- 2FA, loan-edit PIN protection, daily backups, webhook retry handling, and final RLS review
- Production APK release

### Current blockers and manual setup

- A real Supabase project still needs to be created or connected, and the `profiles` migrations need to be run as described in `docs/SUPABASE_SETUP.md`.
- The dashboard screenshot confirms **Email OTP length = 6 digits** and **Email OTP expiration = 600 seconds**. The remaining auth blocker is saving SMTP settings, confirming the `{{ .Token }}` template, and testing delivery to a real Gmail inbox.
- Gmail SMTP does not require a paid custom domain for development. Supabase's personal-email provider warning is expected; use a transactional provider for production.
- App-side Supabase values must be placed in `.env` as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Daraja and other server credentials must remain Supabase Edge Function secrets and are intentionally not part of the current phone build.
- Expo Go is not the phone-testing target for SDK 57. Use the EAS development APK and development client instead.

## Temporary development shortcuts and deferred work

These shortcuts were used to keep development moving. They are not
considered complete product features and must be revisited before a
production release:

- **First-chairman bootstrap:** because no chairman existed initially,
    the first development chairman was promoted manually in Supabase SQL
    by temporarily disabling `trg_prevent_self_role_escalation` inside a
    transaction. Replace this with a documented production bootstrap or
    invite flow before handing the system to the real chairman.
- **Email verification transition:** migrations `0003` and `0005` add a
    protected RPC and trigger marker for `PENDING_EMAIL` to
    `PENDING_APPROVAL`. Confirm that migrations 0003 and 0005 are installed
    in the live project; this has not yet been automated through Supabase
    CLI deployment.
- **Chairman approval and removal:** migrations `0004` and `0006` add the
    `manage_member` RPC and Members-table buttons. The UI now reports errors,
    but the live database must have both migrations applied and the flow
    still needs an end-to-end approve, reject, and remove test.
- **Manual test-user cleanup:** test accounts have been removed directly
    from `auth.users` with SQL. The in-app Remove action is the intended
    replacement, but it still requires live RPC verification and audit
    decisions before production.
- **Email delivery:** Gmail SMTP and Supabase email quotas remain a
    development dependency. Configure a transactional SMTP provider and
    test delivery/rate limits before production.
- **Unimplemented financial workflow:** contributions, fines, transactions,
    Daraja validation/confirmation, allocation, loans, receipts, SMS, audit
    records, RLS review, and backups remain deferred to Steps 4-11.
- **Client delivery:** Vercel is the live web preview. A standalone EAS
    preview/production APK and update strategy still need to be prepared
    after the core workflow is stable.
- **Bank integration decision:** Jenga account services are a future bank
    reconciliation source for Equity transfers and non-M-Pesa deposits.
    Daraja remains the fast M-Pesa confirmation channel until Jenga account
    statement/alert access is provisioned and tested. Do not add Jenga
    transfer or STK Push code; the locked spec requires manual payment.
- **Deployment follow-up:** commit `5912014` is on GitHub, but a later
    manual Vercel CLI deployment returned `Not authorized`. Confirm the
    Vercel Git integration is connected to `Kabatabrian5/thika-chama` with
    `main` as the production branch before relying on automatic deploys.

When resuming, start by applying and verifying migrations 0003-0007 in
Supabase, then test registration -> OTP -> pending approval -> chairman
approve/reject/remove and profile avatar upload without manual SQL. Only
after that resume Step 4.

## Exact continuation point

The project is currently at **Step 3 of 11**. The EAS development APK build and Gmail OTP delivery are working; the next product task is to complete one fresh Register -> six-digit Verify Email -> Waiting for Approval test with the updated bundle. Then continue with **Step 4** by adding the financial tables and RLS migration, followed by the server-only Daraja webhook functions. Do not start Daraja implementation until the phone testing path is working.

## Tech stack
- Expo SDK 57 / React Native 0.86
- TypeScript
- Supabase Auth, Postgres, Realtime, Storage, Edge Functions
- React Navigation
- Daraja C2B for reading M-Pesa confirmations
- Africa's Talking for SMS
- Supabase Auth email delivery; Gmail SMTP is acceptable for development testing, while a transactional provider is recommended for production
- AsyncStorage for auth persistence

## Folder structure

```text
.
├── App.tsx
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
├── README.md
├── app.json
├── index.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env.example
├── .devcontainer/
├── assets/
├── docs/
│   ├── BUILD_ORDER.md
│   ├── SPEC.md
│   ├── SUPABASE_SETUP.md
│   └── AI_HANDOFF.md
├── src/
│   ├── components/
│   ├── lib/
│   │   ├── phone.ts
│   │   ├── supabase.ts
│   │   └── theme.ts
│   ├── navigation/
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── VerifyEmailScreen.tsx
│   │   │   └── WaitingApprovalScreen.tsx
│   │   └── main/
│   │       ├── DashboardScreen.tsx
│   │       └── MembersScreen.tsx
│   └── types/
│       └── index.ts
└── supabase/
    ├── functions/
    └── migrations/
        └── 0001_init_profiles.sql
```

## Design references
The user mentioned image files in a folder on their desktop:

- `C:\Users\hp\OneDrive\Desktop\chama`

These are design references for the app, not code. The repo does not currently include those images, so the handoff note should keep that folder as a design source during implementation.

## Critical rules for future AI/dev work
These rules are important to prevent drift from the client requirements:

1. Do not change the money logic without updating `docs/SPEC.md` first.
2. Keep section comments on every major file and screen.
3. Preserve the project status checklist in `docs/BUILD_ORDER.md`.
4. Treat the app as reading M-Pesa confirmations, not pushing STK prompts.
5. Keep auth status transitions strict:
   - `PENDING_EMAIL` -> Verify Email
   - `PENDING_APPROVAL` -> Waiting Approval
   - `ACTIVE` -> Dashboard
6. Treat the bank account and Paybill as the source of truth for money, not the app.
7. Keep all security and audit expectations aligned with the spec.

## Local setup
### Install dependencies

```bash
npm install
```

### Environment variables
Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required app-side values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Server-side secrets belong in Supabase Edge Function secrets, not in the app bundle:

```env
SUPABASE_SERVICE_ROLE_KEY=
DARAJA_CONSUMER_KEY=
DARAJA_CONSUMER_SECRET=
DARAJA_SHORTCODE=247247
AT_USERNAME=
AT_API_KEY=
SENDGRID_API_KEY=
CHAIRMAN_EMAIL=
TREASURER_EMAIL=
```

## Run the app locally

```bash
npx expo start
```

For Codespaces or remote environments, prefer:

```bash
npx expo start --tunnel
```

## Development conventions
- Every file should have a clear top-of-file section comment explaining why it exists.
- Business logic that is easy to forget should be explained inline near the exact code path.
- Keep naming and status strings consistent with Supabase and the spec.
- Prefer database-backed rules over client-only assumptions.
- Do not invent logic that is not written in `docs/SPEC.md`.

## Build order to continue from here
The live checklist and status notes are maintained in `docs/BUILD_ORDER.md`.

## Security and money handling notes
The app must never be treated as the final authority on money movement. The real money lives in the bank Paybill account, while the app mirrors what Safaricom sends back through Daraja. This project intentionally follows a read-confirmation model, not a push-payment model.

Key principles:
- No STK push from the app
- Validation and confirmation functions are server-side in Supabase
- Loan changes must be auditable
- RLS must be enforced at Supabase
- Reconciliation should compare app records against bank statements

## Handoff instructions for the next AI
When continuing work, keep the following in mind:

- use `docs/SPEC.md` as the source of truth
- update `docs/BUILD_ORDER.md` when a step is completed
- keep section comments in each file
- never assume logic that is not defined in the spec
- keep the repo ready for remote GitHub handoff and explicit environment setup

## Quick command summary

```bash
npm install
cp .env.example .env
npx expo start
```

## Important note about repository state
The repository is connected to the GitHub remote above. Before making the next meaningful implementation change, review `docs/SPEC.md`, `docs/BUILD_ORDER.md`, and `docs/AI_HANDOFF.md`, then update this README with the dated outcome, verification command, blocker, or next action when the work is complete. Keep `docs/BUILD_ORDER.md` and `docs/AI_HANDOFF.md` aligned with the same change.

## Progress log

### 2026-09-02 — Documentation baseline
- Confirmed the project is at Step 3 of 11: authentication, status-gated navigation, dashboard, and read-only members are implemented.
- Confirmed financial totals are intentionally pending because the contributions, fines, and transactions schema does not exist yet.
- Recorded the EAS development-build failure as the current phone-testing blocker; inspect the expanded EAS logs before retrying.
- Next action remains to get the development APK installed and verify the auth/navigation flow, then begin Step 4.

### 2026-09-02 — Android build retry attempt
- The failed build `d196355f-b9b4-4920-a691-8048fb05a602` was confirmed by EAS as an `UNKNOWN_ERROR` in the `Install dependencies` phase, with no artifact.
- A clean local `npm ci --no-audit --no-fund` attempt stalled during package retrieval, and the new EAS submission could not start before the local CLI session timed out.
- The dependency installation later completed successfully: 930 packages were added, with only deprecation and pending install-script warnings.
- A new development build was submitted successfully with `npx eas-cli@latest build --platform android --profile development --non-interactive --no-wait`.
- New build page: https://expo.dev/accounts/briankabatas-team/projects/chama/builds/99699a9a-e138-41f4-9e7d-ae6df06af98d
- The corrected build `3b39beae-5fb3-489e-bfb4-5c3586ccb35b` finished successfully and produced an APK.
- Build page: https://expo.dev/accounts/briankabatas-team/projects/chama/builds/3b39beae-5fb3-489e-bfb4-5c3586ccb35b
- APK download: https://expo.dev/artifacts/eas/rkq895el6GPVAPGkz74iYQbm2Zp_5YZFdZYsTL2FbwA.apk
- The earlier waiting submission returned `request to https://api.expo.dev/graphql failed`; it did not create a second build. The `--no-wait` submission above is the valid build record.

### 2026-09-03 — EAS dependency failure diagnosed
- EAS build `99699a9a-e138-41f4-9e7d-ae6df06af98d` failed in `INSTALL_DEPENDENCIES` because `npm ci` found `package.json` and `package-lock.json` out of sync and reported `Missing: typescript@5.9.3 from lock file`.
- Aligned `typescript` to `~5.9.3` in both manifests and verified the synchronized lockfile with `npm ci --include=dev --ignore-scripts --no-audit --no-fund --dry-run`.

### 2026-09-04 — OTP dashboard settings confirmed
- Confirmed in Supabase Authentication -> Providers -> Email that Email OTP length is `6` digits and expiration is `600` seconds.
- Confirmed the code length is configured in the Email provider settings, not in Email Templates. The Confirm signup template must display `{{ .Token }}`.
- Documented Gmail SMTP as the no-custom-domain development path. Supabase's warning about personal rather than transactional email is expected.
- Live signup testing confirmed that Supabase accepted registration and sent the six-digit code to Gmail.
- Next action: enter the real code in Verify Email and confirm the app reaches Waiting for Approval.

### 2026-09-04 — Registration navigation fix
- Removed the client-side `profiles` insert from `RegisterScreen.tsx`. With email confirmation enabled, signup has no authenticated session and the `profiles` RLS policy correctly rejects that insert.
- Migration `0002_profile_signup_trigger.sql` already creates the profile server-side during `auth.users` insertion, so successful signup can now navigate to the six-digit Verify Email screen.
- Verified with `node_modules/.bin/tsc.cmd --noEmit`; live Gmail delivery was confirmed in the subsequent test entry.

### 2026-09-04 — OTP verification feedback fix
- Added an inline verification error message so wrong or expired codes are visible on web and mobile even when `Alert.alert` is not rendered by the platform.
- After a successful code, the app updates the profile to `PENDING_APPROVAL`, signs out the pending member, and then opens the approval screen so the root session gate cannot reset navigation.
- Verified with `node_modules/.bin/tsc.cmd --noEmit` and `git diff --check`.
- TypeScript and Expo web export passed after the repair.
- Submitted corrected EAS build `3b39beae-5fb3-489e-bfb4-5c3586ccb35b`; it completed successfully and produced the APK linked in the deployment notes above.

### 2026-09-04 — Live Gmail OTP test
- Confirmed a real signup request is accepted by Supabase and a six-digit OTP is sent to Gmail; the email delivery path is working.
- The first wrong-code test gave no visible feedback on Expo web because errors were only sent through `Alert.alert`; inline error rendering is now implemented.
- The successful-code route still needs one fresh end-to-end confirmation after the updated bundle is loaded.

### 2026-09-04 — Resend OTP feedback
- Clarified the verification timer as a resend cooldown, not the OTP expiration timer.
- Resend now shows `Sending...`, confirms visibly when a new code was sent, and displays Supabase rate-limit or delivery errors inline on web and mobile.
- Verified with `node_modules/.bin/tsc.cmd --noEmit` and `git diff --check`.

### 2026-09-04 — Resend rate-limit handling
- Confirmed from Supabase documentation that signup confirmation requests are limited to once every 60 seconds and the default email service allows two auth emails per hour.
- Updated `VerifyEmailScreen.tsx` to recognize throttled resend responses, restart the retry countdown, and explain the Gmail spam/Promotions check instead of making a blocked request appear silently broken.
- Verified with `node_modules/.bin/tsc.cmd --noEmit`.
- Remaining delivery action: wait for the Supabase email quota or configure custom SMTP before repeating multiple OTP tests.

### 2026-09-04 — Wordless launch splash
- Replaced the text-heavy signed-out opening route with a short wordless splash showing the app logo and loading indicator.
- The splash transitions automatically to Login after 1.4 seconds; registration remains available from Login.
- Verified with `node_modules/.bin/tsc.cmd --noEmit` before the Vercel redeploy.

### 2026-09-04 — Auth form usability and duplicate-account feedback
- Registration now limits phone input to 19 digits and national ID input to 8 digits, while retaining Kenyan phone validation and 7-8 digit ID validation.
- Registration errors render inline on web. Duplicate email, phone, or national ID responses now tell the user that the account already exists and to log in instead.
- Login errors render inline, and a confirmed account with a stale `PENDING_EMAIL` profile is advanced to `PENDING_APPROVAL` rather than being sent through OTP again.
- Refined Register and Login styling with branded headers, elevated form surfaces, clearer labels, and stronger primary actions.
- Verified with `node_modules/.bin/tsc.cmd --noEmit`, `npm run build`, and `git diff --check`.

### 2026-09-04 — Email verification status transition
- Fixed the post-OTP error where ordinary members saw `Only chairman or treasurer may change role or status`.
- Verification now calls the protected `complete_email_verification` RPC for the single allowed `PENDING_EMAIL` to `PENDING_APPROVAL` transition.
- Added `supabase/migrations/0003_complete_email_verification.sql`; this migration must be run in the live Supabase SQL Editor before testing the confirmation flow again.

### 2026-09-04 — Chairman member management
- Added protected `manage_member` support in `supabase/migrations/0004_chairman_member_management.sql` for approving, rejecting, or removing accounts.
- The Members table now shows those actions only to chairman and treasurer profiles; account deletion runs server-side and never exposes the service-role key.
- For development bootstrap, promote the owner account once in Supabase SQL Editor with `update public.profiles set role = 'chairman', status = 'ACTIVE' where email = 'your-email@example.com';`.
- Run migrations 0003 and 0004 in Supabase before testing verification and chairman actions.

### 2026-09-04 — Chairman bootstrap trigger repair
- SQL Editor bootstrap updates were blocked by the self-escalation trigger when no chairman existed yet.
- Added migration `0005_allow_protected_email_transition.sql` so the email-verification RPC can perform only its intended status transition while ordinary self-promotion remains blocked.
- To bootstrap the first development chairman, temporarily disable only `trg_prevent_self_role_escalation` inside a transaction, update the chosen profile to `chairman` and `ACTIVE`, re-enable the trigger, and commit. Do not disable the trigger outside that transaction.

### 2026-09-04 — Post-verification approval screen
- Refined `WaitingApprovalScreen.tsx` to match the supplied mobile reference: green chama header, yellow `PENDING_APPROVAL` pill, check confirmation, illustrated approval area, Chairman Approval Required card, and Back to Login action.
- The verified email is now passed into the approval screen and shown in the confirmation message.
- Verified with `node_modules/.bin/tsc.cmd --noEmit` and `git diff --check` before deployment.

### 2026-09-04 — Member action feedback
- Members management now renders approve/reject/remove success and RPC error messages inline on web instead of relying only on `Alert.alert`.
- Added migration `0006_harden_member_management.sql` so the management RPC fails closed when the caller has no valid chairman or treasurer role.
- Run migration 0006 in Supabase before testing the chairman action buttons again.

### 2026-09-04 — Dashboard visual redesign
- Rebuilt `DashboardScreen.tsx` around the supplied mobile reference: branded welcome header, member identity card, colored savings/loan/fine/welfare tiles, Thursday contribution status, quick actions, and recent transactions section.
- Replaced generic bottom-tab indicators with meaningful dashboard, members, contribute, loans, and profile icons.
- Kept all financial amounts marked `Pending` until the financial schema is implemented; quick actions now point to the corresponding tabs.
- Verified with `node_modules/.bin/tsc.cmd --noEmit`.

### 2026-09-04 — Dashboard reference refinement and deadline timer
- Tightened the dashboard composition to the supplied mobile reference with a compact two-line chama header, profile marker, welcome band, compact cards, contribution panel, and quick actions.
- Added a live countdown showing days, hours, minutes, and seconds until the next Thursday 12:00 PM EAT deadline.
- Reserved coral/red danger styling for the Fines card; Savings, Loan Balance, and Welfare use non-danger green/mint treatments.
- Verified with `node_modules/.bin/tsc.cmd --noEmit`, `npm run build`, and `git diff --check`.

### 2026-09-04 — Mobile contribution panel spacing
- Fixed the narrow-screen Thursday Contribution panel so status and deadline countdown stack vertically instead of overlapping.
- Wider layouts retain the side-by-side presentation.
- Verified with `node_modules/.bin/tsc.cmd --noEmit`, `npm run build`, and `git diff --check`.

### 2026-09-04 — Contribute interface in progress
- Added the local reading-mode `ContributeScreen.tsx` and wired it into the Contribute tab.
- The interface includes Paybill instructions, KES 2,500 allocation preview, linked-phone placeholder, five-second polling placeholder, and fine/loan notice.
- This screen is intentionally not marked complete: Paybill details, bank/Jenga/Daraja confirmation, realtime records, and receipts still need implementation.

### 2026-09-04 — Profile interface
- Added `ProfileScreen.tsx` and wired it into the Profile tab using the supplied Edit Profile reference.
- Profile loads the signed-in member from `profiles`, saves validated full name and Kenyan phone changes, locks email and national ID, displays role and verification state, and supports logout.
- Photo selection/storage remains deferred until the storage and image-picker step.
- Verified with `node_modules/.bin/tsc.cmd --noEmit`, `npm run build`, and `git diff --check`.

### 2026-09-05 — Profile avatar storage and image picker
- Installed Expo SDK 57-compatible `expo-image-picker` and configured its permissions through `app.json`.
- Profile photo selection now crops a square image, uploads it to the private Supabase `avatars` bucket, stores the object path in `profiles.avatar_url`, and displays a one-hour signed URL.
- Added `supabase/migrations/0007_profile_avatars_storage.sql` with per-user storage policies. Run it in the live Supabase SQL Editor before testing uploads.
- A new EAS development/preview APK is required for native picker permission changes; the Vercel web preview can use the browser picker after deployment.
- Verified with `npx expo config --type public`, `node_modules/.bin/tsc.cmd --noEmit`, `npm run build`, and `git diff --check`.

### 2026-09-03 — Opening screen
- Added the branded opening screen for signed-out visitors with the Thika Road Chama Group name, community handshake visual, member count, and login/register actions.
- Made the opening screen the first route in the existing auth navigator; active sessions still go directly through the existing profile-status gate.
- Verified with `node_modules/.bin/tsc.cmd --noEmit` and `npm run build`.

### 2026-09-03 — Login screen refinement
- Restyled the Login screen to match the supplied mobile reference: green group header, centered community mark, labeled email/password fields, remember-me control, forgot-password link, prominent Login action, and Register footer.
- Preserved the existing Supabase sign-in and strict profile-status routing behavior.
- Verified the welcome-to-login browser navigation at `http://localhost:8083`, `node_modules/.bin/tsc.cmd --noEmit`, and `npm run build`.

### 2026-09-03 — Mobile Login layout correction
- Removed unnecessary page scrolling from Login and tightened the responsive vertical layout so the complete form fits a phone viewport.
- Verified at `390x844`: Login `scrollHeight` equals `clientHeight`, with the form, actions, and footer visible.

### 2026-09-03 — Registration profile persistence fix
- Fixed registration so profile fields are sent as Supabase Auth metadata and a server-side `auth.users` trigger creates the matching `profiles` row before email confirmation.
- Added `supabase/migrations/0002_profile_signup_trigger.sql`, including a repair query for eligible users created before the trigger.
- The migration must be run in Supabase SQL Editor before testing registration again. Existing users created by the old flow may need to be deleted and recreated because their profile metadata was not captured.
- Verified the registration code with `node_modules/.bin/tsc.cmd --noEmit`.

### 2026-09-04 — Registration usability and OTP settings
- Added Show/Hide controls to both Register password fields.
- Confirmed the app already verifies signup with `verifyOtp` and expects a six-digit code; Supabase must be configured with OTP length `6`, expiration `600` seconds, and `{{ .Token }}` in the Confirm signup template to send a code instead of a link.
- Verified with `node_modules/.bin/tsc.cmd --noEmit` and `npm run build`.

### 2026-09-04 — Handoff maintenance rule
- Confirmed that every meaningful implementation, deployment, schema, or configuration change must update `README.md`, `docs/BUILD_ORDER.md`, and `docs/AI_HANDOFF.md`.
- Each progress entry must include a date, verified outcome, validation command or browser check, and any remaining manual setup or blocker.

Every meaningful implementation, deployment, schema, or verification change should add a dated entry here and update the current status above. Record only facts that have been verified locally or in the linked service.

## App Screens

![App screen 1](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%281%29.jpeg)
![App screen 2](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%282%29.jpeg)
![App screen 3](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%283%29.jpeg)
![App screen 4](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%284%29.jpeg)
![App screen 5](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%285%29.jpeg)
![App screen 6](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%286%29.jpeg)
![App screen 7](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%287%29.jpeg)
![App screen 8](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%288%29.jpeg)
![App screen 9](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%289%29.jpeg)
![App screen 10](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%2810%29.jpeg)
![App screen 11](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%2811%29.jpeg)
![App screen 12](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%2812%29.jpeg)
![App screen 13](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%2813%29.jpeg)
![App screen 14](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%2814%29.jpeg)
![App screen 15](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%2815%29.jpeg)
![App screen 16](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%2816%29.jpeg)
![App screen 17](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%2817%29.jpeg)
![App screen 18](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52%20%2818%29.jpeg)
![App screen 19](docs/screenshots/WhatsApp%20Image%202026-09-02%20at%2010.27.52.jpeg)
## Latest handoff update: 2026-09-02

The project is currently at Step 3 of 11. Steps 1-3 are complete:

- Expo SDK 57 React Native TypeScript app
- Supabase client and profiles migration
- Register, email OTP verification, chairman approval waiting, and login screens
- Status-based access control
- Dashboard screen
- Read-only Members directory with search
- Bottom navigation for Dashboard, Members, Contribute, Loans, and Profile

Daraja implementation has intentionally not started yet. The immediate goal is to install the app on an Android phone first.

### EAS phone build status

An Expo account was created/logged into successfully using `npx eas-cli`.

The project is linked to:

- Expo account/team: `briankabatas-team`
- EAS project: `chama`
- Android package: `com.kabatabrian5.thikachama`
- EAS project ID: `b4e90820-f27c-48ee-9b1e-9eefbb0be9a5`

`expo-dev-client` was installed successfully. The Expo slug was corrected from `thika-chama` to `chama` because it needed to match the linked EAS project.

The development build was submitted with:

```powershell
npx eas-cli@latest build --platform android --profile development
Build page:

https://expo.dev/accounts/briankabatas-team/projects/chama/builds/d196355f-b9b4-4920-a691-8048fb05a602

The build waited in the free queue for approximately one hour, then failed during the Android build. No APK download link was produced. The next AI should open the EAS build page and inspect the expanded build logs to identify the exact failure before retrying.

The build is a development/test APK, not the final production APK.

Important next actions
Inspect the failed EAS build logs and fix the build error.
Retry the development Android build.
Wait for the build to finish.
Download and install the APK on the Android phone.
Confirm that the app opens and test the current authentication/navigation flow.
Do not begin Daraja work until phone testing is working.
After phone installation is confirmed, continue with Step 4:
Add contributions, fines, and transactions migrations.
Add RLS policies.
Implement server-only Daraja validation and confirmation Edge Functions.
Test allocation and idempotency.
Keep the production APK for the end of the project, after payments, loans, receipts, permissions, and security are complete.
Verification already completed
These commands passed before the EAS build attempt:
The web build exported successfully to dist.

Environment reminders
The real Supabase project still needs to be created/configured manually. The .env file must contain:


Never place service-role, Daraja, SMS, or email provider secrets in the Expo app bundle.
Use the following documents as the source of truth:

docs/SPEC.md
docs/BUILD_ORDER.md
docs/SUPABASE_SETUP.md
docs/AI_HANDOFF.md
README.md

