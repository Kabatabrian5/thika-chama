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
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radius } from '../../lib/theme';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'WaitingApproval'>;

export default function WaitingApprovalScreen({ navigation, route }: Props) {
  const email = route.params?.email;

  async function handleBackToLogin() {
    // See file header comment: sign out so no ACTIVE-only screen
    // downstream can be reached with a technically-valid session
    // that belongs to a not-yet-approved member.
    await supabase.auth.signOut();
    navigation.replace('Login');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerIcon}><Text style={styles.headerIconText}>••</Text><Text style={styles.headerArc}>⌒</Text></View>
        <Text style={styles.headerTitle}>Thika Road Chama Group</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeClock}>◷</Text>
          <Text style={styles.badgeText}>PENDING_APPROVAL</Text>
        </View>

        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>Email Verified</Text>
        <Text style={styles.subtitle}>Successfully Verified!</Text>
        <Text style={styles.body}>Your email <Text style={styles.email}>{email ?? 'address'}</Text> is confirmed.</Text>

        <View style={styles.illustration}>
          <View style={styles.personHead} />
          <View style={styles.personBody} />
          <View style={styles.personPhone} />
          <View style={styles.plantLeft} />
          <View style={styles.plantRight} />
          <Text style={styles.clock}>◷</Text>
          <Text style={styles.sparkle}>✦</Text>
        </View>

        <View style={styles.nextStepCard}>
          <View style={styles.nextStepIcon}><Text style={styles.nextStepIconText}>CM</Text></View>
          <View style={styles.nextStepCopy}>
          <Text style={styles.nextStepEyebrow}>Next step:</Text>
          <Text style={styles.nextStepTitle}>Chairman Approval Required</Text>
          <Text style={styles.nextStepBody}>
            Chairman Maina will review your request to join Thika Road Chama Group (15 members).
          </Text>
          <Text style={styles.nextStepBody}>
            ✉ You will receive an email once approved.
          </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleBackToLogin}>
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToLogin}>
          <Text style={styles.secondaryButtonText}>Check Approval Status</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5FAF5' },
  contentContainer: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    flexDirection: 'row',
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerIcon: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 18, height: 36, justifyContent: 'center', marginRight: spacing.sm, width: 36 },
  headerIconText: { color: colors.white, fontSize: 16, fontWeight: '900', letterSpacing: -5, lineHeight: 14, marginLeft: -3 },
  headerArc: { color: colors.white, fontSize: 18, fontWeight: '900', lineHeight: 12, marginTop: -2 },
  headerTitle: { color: colors.primaryDark, fontSize: 18, fontWeight: '900' },
  content: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 28, flex: 1, margin: spacing.md, padding: spacing.lg, shadowColor: colors.primaryDark, shadowOffset: { height: 8, width: 0 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 3 },
  badge: {
    alignItems: 'center',
    backgroundColor: '#FFF4C9',
    borderColor: '#F0D873',
    borderWidth: 1,
    borderRadius: radius.pill,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeClock: { color: '#A27C00', fontSize: 18, fontWeight: '900', marginRight: spacing.xs },
  badgeText: { color: '#A27C00', fontSize: 12, fontWeight: '900' },
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
  title: { color: colors.success, fontSize: 26, fontWeight: '900', marginTop: spacing.md },
  subtitle: { color: colors.text, fontSize: 27, fontWeight: '900', marginTop: spacing.xs, textAlign: 'center' },
  body: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm, textAlign: 'center' },
  email: { color: colors.text, fontWeight: '800' },
  illustration: { height: 190, marginTop: spacing.md, overflow: 'hidden', position: 'relative', width: '100%' },
  personHead: { backgroundColor: '#F4C9A8', borderRadius: 30, height: 52, left: '43%', position: 'absolute', top: 24, width: 52 },
  personBody: { backgroundColor: '#5BA871', borderRadius: 54, bottom: 8, height: 118, left: '30%', position: 'absolute', width: 150 },
  personPhone: { backgroundColor: '#202B2B', borderRadius: 5, height: 48, left: '49%', position: 'absolute', top: 82, transform: [{ rotate: '-18deg' }], width: 28 },
  plantLeft: { borderColor: '#A6D29E', borderRadius: 40, borderWidth: 14, bottom: 16, height: 88, left: 18, position: 'absolute', transform: [{ rotate: '-28deg' }], width: 46 },
  plantRight: { borderColor: '#B3DDA8', borderRadius: 40, borderWidth: 14, bottom: 10, height: 100, position: 'absolute', right: 18, transform: [{ rotate: '28deg' }], width: 48 },
  clock: { color: colors.primary, fontSize: 28, left: 30, position: 'absolute', top: 18 },
  sparkle: { color: '#86B98A', fontSize: 30, position: 'absolute', right: 42, top: 20 },
  nextStepCard: {
    alignItems: 'center',
    backgroundColor: '#F1F9EF',
    borderColor: '#B4D5B0',
    borderWidth: 1,
    borderRadius: radius.md,
    flexDirection: 'row',
    padding: spacing.md,
    marginTop: spacing.sm,
    width: '100%',
  },
  nextStepIcon: { alignItems: 'center', backgroundColor: '#9BCEA0', borderRadius: 22, height: 44, justifyContent: 'center', marginRight: spacing.sm, width: 44 },
  nextStepIconText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  nextStepCopy: { flex: 1 },
  nextStepEyebrow: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: spacing.xs },
  nextStepTitle: { color: colors.primary, fontSize: 18, fontWeight: '900', marginBottom: spacing.xs },
  nextStepBody: { color: colors.text, fontSize: 13, lineHeight: 19, marginBottom: spacing.xs },
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
  secondaryButton: { alignItems: 'center', marginTop: spacing.md, paddingVertical: spacing.sm },
  secondaryButtonText: { color: colors.primaryDark, fontSize: 14, fontWeight: '700' },
});
