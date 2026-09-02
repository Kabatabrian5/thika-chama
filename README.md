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
- Added temporary empty views for Contribute, Loans, and Profile until their build-order steps are implemented.

### Deployment and phone testing preparation

- Connected the repository to `https://github.com/Kabatabrian5/thika-chama`.
- Configured Vercel to export the Expo web preview to `dist`.
- Added EAS Android development, preview, and production profiles.
- Linked the app to the Expo EAS project under the `briankabatas-team` account.
- Installed `expo-dev-client` for the development APK.
- Aligned the Expo slug with the linked EAS project (`chama`). The visible app name remains `thika-chama` and the Android package remains `com.kabatabrian5.thikachama`.
- Generated and stored the Android signing keystore through Expo.
- Submitted the Android development build to EAS. The current build is queued on the free tier; it is a test/development APK, not the final production release. Build page: https://expo.dev/accounts/briankabatas-team/projects/chama/builds/d196355f-b9b4-4920-a691-8048fb05a602

### Verification completed

- `node_modules/.bin/tsc.cmd --noEmit` passed.
- `npm run build` passed and exported the web app to `dist`.
- EAS accepted the Android build upload and created a build page. The APK download link will appear when the build status becomes `Finished`.

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

- A real Supabase project still needs to be created or connected, the `profiles` migration needs to be run, and the email OTP/RLS settings need to be configured as described in `docs/SUPABASE_SETUP.md`.
- App-side Supabase values must be placed in `.env` as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Daraja and other server credentials must remain Supabase Edge Function secrets and are intentionally not part of the current phone build.
- Expo Go is not the phone-testing target for SDK 57. Use the EAS development APK and development client instead.

## Exact continuation point

The project is currently at **Step 3 of 11**. The immediate user-facing task is to finish the queued EAS development build and install its APK on an Android phone. After phone installation is confirmed, continue with **Step 4** by adding the financial tables and RLS migration, followed by the server-only Daraja webhook functions. Do not start Daraja implementation until the phone testing path is working.

## Tech stack
- Expo SDK 57 / React Native 0.86
- TypeScript
- Supabase Auth, Postgres, Realtime, Storage, Edge Functions
- React Navigation
- Daraja C2B for reading M-Pesa confirmations
- Africa's Talking for SMS
- SendGrid for email
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
The repository is connected to the GitHub remote above. Before making the next meaningful implementation change, review `docs/SPEC.md`, `docs/BUILD_ORDER.md`, and `docs/AI_HANDOFF.md`, then update the status documentation when the work is complete.

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
