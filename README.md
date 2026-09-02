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
- Dashboard placeholder exists while Step 3 is still pending

This means the project is at the early auth stage, not yet complete for the full chama workflow.

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
│   │       └── DashboardPlaceholder.tsx
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
The project is currently at Step 2 of 11 in the build order. The next major step is:

- Step 3: Dashboard + Members (read-only)

The full tracked checklist is in `docs/BUILD_ORDER.md`.

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

## Important note about repo URL
Because this workspace clone does not yet have a GitHub remote configured, the actual GitHub URL must be added before sharing or pushing the repo. Until then, the local repo path is the only reliable identifier.
