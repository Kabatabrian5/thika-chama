/**
 * ============================================================
 * WAITING FOR CHAIRMAN APPROVAL SCREEN
 * ============================================================
 * Step 3 of the auth flow. Reached either:
 *   (a) right after VerifyEmailScreen succeeds, or
 *   (b) when a PENDING_APPROVAL member tries to log in again
 *       later — LoginScreen redirects here instead of letting
 *       them reach the dashboard (see LoginScreen.tsx).
 *
 * This screen deliberately has NO way to reach the dashboard.
 * The only action is "Back to Login", which signs the member
 * out — this matters because otherwise a valid Supabase session
 * would sit in AsyncStorage and something downstream (a screen
 * we build later) might assume "logged in" == "ACTIVE" and leak
 * access. Signing out here keeps that assumption safe everywhere else.
 * ============================================================
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radius } from '../../lib/theme';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'WaitingApproval'>;

export default function WaitingApprovalScreen({ navigation }: Props) {
  async function handleBackToLogin() {
    // See file header comment: sign out so no ACTIVE-only screen
    // downstream can be reached with a technically-valid session
    // that belongs to a not-yet-approved member.
    await supabase.auth.signOut();
    navigation.replace('Login');
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Thika Road Chama Group</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⏳ PENDING_APPROVAL</Text>
        </View>

        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>Email Verified</Text>
        <Text style={styles.subtitle}>Successfully Verified!</Text>
        <Text style={styles.body}>Your email is confirmed.</Text>

        <View style={styles.nextStepCard}>
          <Text style={styles.nextStepTitle}>Chairman Approval Required</Text>
          <Text style={styles.nextStepBody}>
            Chairman Maina will review your request to join Thika Road Chama Group (15 members).
          </Text>
          <Text style={styles.nextStepBody}>
            📧 You will receive an email once approved.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleBackToLogin}>
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: {
    backgroundColor: colors.primaryLight,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: { color: colors.primaryDark, fontSize: 16, fontWeight: '700' },
  content: { padding: spacing.lg, alignItems: 'center' },
  badge: {
    backgroundColor: '#FDF3D9',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.lg,
  },
  badgeText: { color: colors.warning, fontWeight: '700', fontSize: 12 },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  checkMark: { color: colors.white, fontSize: 32, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '800', color: colors.success, marginTop: spacing.md },
  subtitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.xs },
  body: { color: colors.textMuted, marginTop: spacing.xs },
  nextStepCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
  },
  nextStepTitle: { color: colors.primaryDark, fontWeight: '700', marginBottom: spacing.xs },
  nextStepBody: { color: colors.text, marginBottom: spacing.xs, fontSize: 13 },
  button: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.lg,
  },
  buttonText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
});
