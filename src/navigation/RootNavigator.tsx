/**
 * ============================================================
 * ROOT NAVIGATOR
 * ============================================================
 * This is the single source of truth for "what should the
 * member see right now?" It:
 *
 *   1. Checks for an existing Supabase session on app launch
 *      (so a member who already logged in doesn't have to log
 *      in again every time they open the app).
 *   2. Subscribes to onAuthStateChange so login/logout anywhere
 *      in the app (Login screen, Logout button, token expiry)
 *      immediately updates what's shown here.
 *   3. Loads the matching `profiles` row and looks at `status`:
 *        - no session at all           -> AuthNavigator (Login)
 *        - session but status ACTIVE   -> MainNavigator (Dashboard)
 *        - session but NOT ACTIVE      -> AuthNavigator, so the
 *          member re-lands on Login, which then routes them to
 *          VerifyEmail/WaitingApproval based on status (see
 *          LoginScreen.tsx). This handles the "closed the app
 *          mid-flow, came back later" case correctly.
 *
 * IMPORTANT: this file is the ONLY place that should gate
 * dashboard access by status. Don't duplicate this check in
 * individual screens — keep it in one place so it can't drift.
 * ============================================================
 */
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import type { ProfileStatus } from '../types';
import { colors } from '../lib/theme';

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<ProfileStatus | null>(null);
  const [checkingInitialSession, setCheckingInitialSession] = useState(true);

  useEffect(() => {
    // Initial check on cold start.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingInitialSession(false);
    });

    // Live updates: fires on sign-in, sign-out, and token refresh.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setStatus(null);
      return;
    }

    // Re-fetch the profile status whenever the session changes —
    // this is what lets LoginScreen's ACTIVE case (which doesn't
    // navigate anywhere itself) correctly flip the whole app over
    // to MainNavigator.
    supabase
      .from('profiles')
      .select('status')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.warn('Could not load profile status:', error.message);
          setStatus(null);
          return;
        }
        setStatus(data.status);
      });
  }, [session]);

  if (checkingInitialSession) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const shouldShowMainApp = !!session && status === 'ACTIVE';

  return (
    <NavigationContainer>
      {shouldShowMainApp ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
