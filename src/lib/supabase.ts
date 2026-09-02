/**
 * ============================================================
 * SUPABASE CLIENT
 * ============================================================
 * This file creates ONE shared Supabase client that every screen
 * in the app imports from. Never create a second client — you'd
 * end up with two separate auth sessions and confusing bugs.
 *
 * Reads its config from EXPO_PUBLIC_SUPABASE_URL and
 * EXPO_PUBLIC_SUPABASE_ANON_KEY, which come from your .env file
 * (see .env.example in the project root).
 *
 * The ANON key is safe to ship inside the app — it only grants
 * whatever Row Level Security (RLS) policies allow. All real
 * protection lives in the RLS policies defined in
 * supabase/migrations/, not in this key.
 * ============================================================
 */

// Polyfill required because Supabase's realtime client relies on
// browser URL APIs that don't exist by default in React Native.
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly and early rather than getting a cryptic network
  // error later when someone forgets to set up their .env file.
  throw new Error(
    'Missing Supabase env vars. Did you copy .env.example to .env and fill it in?'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // AsyncStorage persists the login session on the phone so the
    // member doesn't have to log in again every time they open the app.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // We're in React Native, not a browser, so there's no URL bar
    // to parse an OAuth redirect from — this must be false.
    detectSessionInUrl: false,
  },
});
