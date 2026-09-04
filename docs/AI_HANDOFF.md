# AI Handoff: Thika Road Chama Group

## Project identity
- GitHub: https://github.com/Kabatabrian5/thika-chama
- Local workspace: `C:\projects\thika-chama`
- Branch: `main`
- Last known deployed code commit: `0f07883` before the current handoff update
- Product: Expo React Native app with an Expo web preview for a 15-member chama in Thika Road, Nairobi

## Read first
1. `docs/SPEC.md` is the locked business and product specification.
2. `docs/BUILD_ORDER.md` is the live implementation checklist.
3. `docs/SUPABASE_SETUP.md` contains manual backend setup.
4. `README.md` contains setup, architecture, and handoff basics.
5. This file records current decisions, blockers, and deployment notes.

## Current implementation
- Steps 1-2: complete. Expo scaffold, Supabase client, auth screens, profile status routing, and RLS profile migration exist.
- Step 3: complete. Bottom tabs, profile-backed Dashboard, and read-only Members directory with search exist.
- Step 4+: pending. Contributions, Daraja webhooks, allocation waterfall, fines, loans, receipts, and role administration are not complete.
- The Contribute tab now has a local uncommitted reading-mode interface in `ContributeScreen.tsx`; live payment confirmation and receipts are not implemented yet. Loans and Profile still use temporary empty views.
- The Profile tab now uses `ProfileScreen.tsx`. It loads/saves full name and phone, locks email and national ID, shows role/verification state, and logs out. Avatar upload/storage, password change, receipts, and exports remain deferred.
- Profile avatar upload is now implemented with SDK 57 `expo-image-picker` and private Supabase Storage bucket `avatars`; `profiles.avatar_url` stores the object path and the app uses signed URLs. Run migration 0007 in Supabase and create a new native EAS build for permission changes before phone testing.
- Signed-out visitors now land on `WelcomeScreen.tsx`, which links to the existing Login and Register screens.
- `LoginScreen.tsx` now matches the supplied reference layout with branded header, community mark, field controls, remember-me row, and register footer.
- Login uses a fixed flex layout rather than a page `ScrollView`; the complete form was verified at `390x844` with no document scrolling.
- Registration now passes full name, normalized phone, and national ID through Auth metadata; migration `0002_profile_signup_trigger.sql` creates `profiles` server-side before email confirmation.
- Registration password and confirm-password fields now include Show/Hide controls.
- `RegisterScreen.tsx` no longer inserts into `profiles` from the client after signup. Because email-confirmed signup has no session, that insert was blocked by RLS; migration `0002_profile_signup_trigger.sql` is the sole profile-creation path during signup.
- `VerifyEmailScreen.tsx` now renders verification and resend errors inline, because `Alert.alert` can be invisible on Expo web. After successful verification it updates `PENDING_APPROVAL`, signs out the pending session, and navigates to `WaitingApproval`.
- The Verify Email resend control has a local 60-second cooldown. It now labels that cooldown accurately, shows `Sending...`, confirms a new code visibly, and renders Supabase resend errors inline. Supabase may still rate-limit repeated emails; wait for the displayed cooldown/rate-limit period before trying again.
- Resend rate-limit responses are now identified explicitly, trigger the local retry cooldown, and tell the member to check Gmail spam/Promotions. Supabase allows one signup confirmation request every 60 seconds and its default email service allows two auth emails per hour; repeated testing requires waiting for the quota or configuring custom SMTP.
- `WelcomeScreen.tsx` is now a wordless animated splash route. It displays the app logo and loading indicator for 1.4 seconds, then replaces itself with Login; Register remains reachable from Login.
- Register and Login now show errors inline on web. Register limits phone input to 19 digits and national ID to 8 digits, maps duplicate email/phone/ID responses to a log-in instruction, and uses a more polished form layout. Login recovers a confirmed account whose profile is still marked `PENDING_EMAIL` by moving it to `PENDING_APPROVAL`.
- `VerifyEmailScreen.tsx` now calls the protected `complete_email_verification` RPC instead of directly updating profile status. This fixes the legitimate post-OTP transition being rejected by the role/status protection trigger. Run `supabase/migrations/0003_complete_email_verification.sql` in the live SQL Editor before testing.
- `MembersScreen.tsx` now exposes Approve, Reject, and Remove actions only for chairman/treasurer profiles. These call protected RPC `manage_member` from migration 0004; deletion removes the Auth user server-side and cascades the profile. Promote a development owner account once with a targeted SQL update before testing.
- If SQL Editor bootstrap reports `Only chairman or treasurer may change role or status`, use the one-time transaction documented in README to disable only the self-escalation trigger while promoting the first development chairman. Run migration 0005 afterward so the protected email-verification RPC is not blocked by the same trigger.
- `WaitingApprovalScreen.tsx` now matches the supplied post-verification reference and receives the verified email through the optional `WaitingApproval` route parameter.
- Members action results now render inline on web. Run `supabase/migrations/0006_harden_member_management.sql` in the live project to apply the fail-closed role check to the existing `manage_member` RPC.
- `DashboardScreen.tsx` now follows the supplied mobile reference with a welcome identity band, colored summary tiles, contribution status, quick actions, and recent transactions. Values remain pending until the financial schema exists; `MainNavigator.tsx` now supplies meaningful tab icons.
- Dashboard countdown now updates every second toward the next Thursday 12:00 PM EAT deadline. Only Fines uses danger coloring; savings, loan, and welfare tiles use calm non-danger treatments.
- On narrow screens, the Thursday Contribution status and countdown now stack vertically to prevent overlap; wide screens remain side-by-side.
- Jenga documentation was reviewed: use Jenga Account Balance/Mini-Statement/Full Statement/Account Alerts later for Equity reconciliation, especially non-M-Pesa deposits. Keep Daraja as the provisional M-Pesa confirmation path and do not implement Jenga transfers or STK Push.
- The latest pushed commit is `5912014`; a subsequent manual Vercel CLI deployment returned `Not authorized`, so verify the Vercel Git integration before assuming every GitHub push deploys.
- Development has used temporary manual SQL shortcuts for first-chairman bootstrap, deleting test users, and repairing stuck statuses. Treat those as deferred work, not completed product behavior. Before production, apply and verify migrations 0003-0006 in the live Supabase project and complete registration -> OTP -> pending approval -> chairman approve/reject/remove without SQL.
- Signup verification remains six-digit OTP-based in the app; Supabase must use OTP length `6`, expiry `600` seconds, and `{{ .Token }}` in the Confirm signup template instead of `{{ .ConfirmationURL }}`.
- Supabase Email provider settings have been confirmed in the dashboard: `Email OTP expiration = 600` seconds and `Email OTP length = 6` digits. These values are configured under Authentication -> Providers -> Email, not inside the email template.
- The Confirm signup template must display `{{ .Token }}`. Gmail SMTP can be used for development without buying a custom domain. Supabase may warn that Gmail is intended for personal rather than transactional email; accept that limitation for small-scale testing and use a transactional provider for production.

## Important product rules
- Weekly contribution is KES 2,500: KES 2,000 savings and KES 500 welfare.
- Deadline is Thursday at 12:00 PM EAT; missed payment creates a KES 400 fine.
- Payment is manual M-Pesa Paybill reading through Daraja C2B. Do not add STK push.
- Allocation priority is fine, then weekly contribution, then loan, then overdue/advance.
- Identify members by canonical phone number and loan balance, not by BillRef alone.
- Bank records are the final money authority; the app mirrors confirmed payments.

## Vercel deployment
- Vercel project name: `thika-chama`
- Root directory: `/`
- Framework preset: `Other`
- Build command: `npm run build`
- Output directory: `dist`
- `vercel.json` serves the Expo web export and no longer rewrites traffic to the legacy API prototype.
- `npm run build` was verified locally and exported `dist` successfully.
- Expo SDK 57 requires Node `>=22.13.0`; this requirement is declared in `package.json` for Vercel.
- Expo Go on the user's phone reported an SDK incompatibility with SDK 57, so the project is being downgraded to Expo SDK 54 (`expo ~54.0.37`, React `19.1.0`, React Native `0.81.5`).
- The project now uses Expo SDK 57 again for the EAS development-build path. Expo Go is not the phone-testing target because the installed Expo Go version is incompatible with SDK 57.
- `eas.json` defines `development` (internal development client), `preview` (internal installable build), and `production` profiles.
- Android application ID is `com.kabatabrian5.thikachama` in `app.json`.
- EAS project ID is `b4e90820-f27c-48ee-9b1e-9eefbb0be9a5`; it is linked directly under `expo.extra.eas.projectId` in `app.json` because the interactive `eas init` process became stuck after browser authentication.
- The first EAS attempt used `npx eas`, which resolves the unrelated npm package `eas@0.1.0` and fails with "could not determine executable to run". Use the official package name `eas-cli` instead: `npx eas-cli@latest build --platform android --profile development`.
- `eas-cli@23.2.0` and `@sentry/core@10.73.0` are now installed as development dependencies; the missing-module error is fixed and `node_modules/.bin/eas.cmd --version` returns `eas-cli/23.2.0`.
- An earlier local build attempt with the repaired CLI produced no output and was stopped before authentication or cloud build submission; this is historical only because the corrected EAS build below succeeded.
- `react-dom` is pinned to `19.2.3` to match React `19.2.3`; leaving it as `^19.2.3` allowed npm to resolve `19.2.8` and caused a peer-dependency conflict during deployment.
- EAS build `99699a9a-e138-41f4-9e7d-ae6df06af98d` failed because `npm ci` reported `Missing: typescript@5.9.3 from lock file`; `package.json` and `package-lock.json` are now aligned on `typescript ~5.9.3`.
- Corrected build `3b39beae-5fb3-489e-bfb4-5c3586ccb35b` finished successfully. APK: https://expo.dev/artifacts/eas/rkq895el6GPVAPGkz74iYQbm2Zp_5YZFdZYsTL2FbwA.apk
- Latest local verification: `node_modules/.bin/tsc.cmd --noEmit` passed and `npm run build` exported `dist` successfully.
- If Vercel still reports an error, open the failed deployment and inspect the Build Logs. The screenshot alone does not contain the cause.

## Environment setup
App variables belong in `.env` and must use the `EXPO_PUBLIC_` prefix:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Server secrets must stay in Supabase Edge Function secrets, never in the Expo bundle:
- `SUPABASE_SERVICE_ROLE_KEY`
- Daraja credentials
- Africa's Talking credentials
- SendGrid credentials

Never commit `.env` or service-role credentials.

Auth email delivery decision:
- The app requires a six-digit signup OTP, not a confirmation link.
- Configure Email OTP length as `6` and expiration as `600` seconds under Authentication -> Providers -> Email.
- Configure Confirm signup under Email Templates to display `{{ .Token }}`.
- Gmail SMTP is acceptable for development testing and does not require a paid custom domain. A personal-email provider warning from Supabase is expected; use transactional SMTP for production.

## Design references
The original design images are stored outside this repo at:
`C:\Users\hp\OneDrive\Desktop\chama`

They are reference material for the UI. Copy only approved assets into `assets/` if they are needed and safe to commit.

## Coding and debugging conventions
- Add a short top-of-file section comment to every new source file explaining why it exists.
- Add inline comments only for non-obvious business, security, or integration decisions.
- Keep comments close to the code they explain so another AI can debug the flow quickly.
- Update `docs/BUILD_ORDER.md` whenever a step changes status.
- Update this file whenever implementation, deployment, environment, schema, or architectural decisions change.
- The 2026-09-03 opening-screen change passed `node_modules/.bin/tsc.cmd --noEmit` and `npm run build`.
- The 2026-09-03 Login screen refinement passed `node_modules/.bin/tsc.cmd --noEmit` and `npm run build`; browser navigation from Welcome to Login was verified at `http://localhost:8083`.
- The mobile layout correction also passed those checks and a browser viewport check at `390x844`.
- Registration persistence fix passed `node_modules/.bin/tsc.cmd --noEmit`; run migration 0002 in Supabase before testing it.
- Run `node_modules/.bin/tsc.cmd --noEmit` after TypeScript changes.
- Run `npm run build` after web/deployment changes.
- Do not claim a deployment or test succeeded without fresh command output.

## Phone testing path
Use an EAS development build instead of Expo Go:

```bash
npx eas login
npx eas build:configure
npx eas build --platform android --profile development
```

Install the resulting APK on the Android phone. Later code changes can be tested with the development server and development client. EAS requires the user to authenticate with their Expo account before the cloud build.

## Next action
Supabase accepted a real signup and Gmail received the six-digit OTP. Finish one fresh end-to-end verification with the updated web bundle, then implement Step 4 and Step 5 in order:
1. Enter the real code and confirm VerifyEmailScreen reaches Waiting for Approval.
2. Add contributions/fines/transactions schema and RLS migration.
3. Add server-only Daraja validation and confirmation Edge Functions.
4. Test idempotency and phone lookup with Daraja simulator payloads.
5. Build the reading-mode Contribute screen and realtime receipt flow.

## Handoff rule
Every future AI or developer must update `README.md`, `docs/BUILD_ORDER.md`, and this file when a meaningful project decision or implementation step is completed. The repository should always explain what is done, what is next, what is blocked, and how to verify it.

Every meaningful change must also add a dated entry to the `README.md` progress log. Include the implementation result, verification command or browser check, and any remaining manual setup or blocker. Do not mark a feature complete based only on intended code; record only behavior verified locally or in the connected service.
