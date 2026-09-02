/**
 * ============================================================
 * SHARED TYPES
 * ============================================================
 * These mirror the DB schema in supabase/migrations/. Keep this
 * file in sync whenever the schema changes — mismatched types
 * here are a common source of silent bugs (e.g. typo-ing a
 * status string that the DB never actually produces).
 * ============================================================
 */

// A member's account goes through these states in order:
// PENDING_EMAIL (just registered, code not confirmed yet)
//   -> PENDING_APPROVAL (email confirmed, waiting on Chairman)
//   -> ACTIVE (can use the full app)
// A Chairman can also REJECT an application at the approval step.
export type ProfileStatus =
  | 'PENDING_EMAIL'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REJECTED';

export type ProfileRole = 'chairman' | 'treasurer' | 'member';

// Matches the `profiles` table exactly (see 0001_init.sql).
export interface Profile {
  id: string; // uuid, FK to auth.users
  email: string;
  phone: string; // stored in 254XXXXXXXXX format
  full_name: string;
  national_id: string;
  role: ProfileRole;
  status: ProfileStatus;
  avatar_url: string | null;
  created_at: string;
}

// Params collected on the Register screen before we call
// supabase.auth.signUp().
export interface RegisterFormValues {
  fullName: string;
  email: string;
  phone: string; // as typed by user, 07XXXXXXXX — we normalize later
  nationalId: string;
  password: string;
  confirmPassword: string;
}
