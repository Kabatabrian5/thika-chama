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
- The Contribute, Loans, and Profile tabs currently use temporary empty views until their build-order steps.

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
- The first EAS attempt used `npx eas`, which resolves the unrelated npm package `eas@0.1.0` and fails with "could not determine executable to run". Use the official package name `eas-cli` instead: `npx eas-cli@latest build --platform android --profile development`.
- The official `eas-cli` download was slow in this Windows environment, so no Android build or APK link has been created yet.
- `react-dom` is pinned to `19.2.3` to match React `19.2.3`; leaving it as `^19.2.3` allowed npm to resolve `19.2.8` and caused a peer-dependency conflict during deployment.
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
After the EAS phone build is working, implement Step 4 and Step 5 in order:
1. Add contributions/fines/transactions schema and RLS migration.
2. Add server-only Daraja validation and confirmation Edge Functions.
3. Test idempotency and phone lookup with Daraja simulator payloads.
4. Build the reading-mode Contribute screen and realtime receipt flow.

## Handoff rule
Every future AI or developer must update `README.md`, `docs/BUILD_ORDER.md`, and this file when a meaningful project decision or implementation step is completed. The repository should always explain what is done, what is next, what is blocked, and how to verify it.
