/**
 * ============================================================
 * LOGIN SCREEN
 * ============================================================
 * After a successful password check, we DON'T just assume the
 * member can reach the dashboard. We look up their `profiles.status`
 * and route based on it:
 *
 *   PENDING_EMAIL    -> VerifyEmail   (never finished step 2)
 *   PENDING_APPROVAL -> WaitingApproval (finished step 2, not yet approved)
 *   ACTIVE           -> Dashboard (handled by RootNavigator swapping
 *                        to MainNavigator once it sees an ACTIVE profile)
 *   REJECTED         -> shown an error, signed back out
 *
 * This status check is WHY WaitingApprovalScreen and VerifyEmailScreen
 * both exist as reachable screens even outside the fresh-signup path —
 * a member might close the app mid-flow and come back days later.
 * ============================================================
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radius } from '../../lib/theme';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Missing details', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      switch (profile.status) {
        case 'PENDING_EMAIL':
          navigation.navigate('VerifyEmail', { email: email.trim().toLowerCase() });
          break;
        case 'PENDING_APPROVAL':
          navigation.navigate('WaitingApproval');
          break;
        case 'REJECTED':
          await supabase.auth.signOut();
          Alert.alert(
            'Application not approved',
            'Your membership request was not approved. Please contact the Chairman.'
          );
          break;
        case 'ACTIVE':
          // Intentionally do nothing else here — RootNavigator listens
          // to the auth session + profile status and will automatically
          // swap from AuthNavigator to MainNavigator once it re-checks
          // and sees ACTIVE. See navigation/RootNavigator.tsx.
          break;
        default:
          throw new Error(`Unknown profile status: ${profile.status}`);
      }
    } catch (err: any) {
      Alert.alert('Login failed', err.message ?? 'Please check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thika Road Chama Group</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.brandShield}>
          <View style={styles.brandShieldInner}>
            <Text style={styles.brandPeople}>●●</Text>
            <Text style={styles.brandArc}>⌒</Text>
          </View>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to your chama account</Text>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputShell}>
            <Text style={styles.inputIcon}>@</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.inputShell}>
            <Text style={styles.inputIcon}>*</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword((s) => !s)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.rememberOption} onPress={() => setRememberMe((value) => !value)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerAction}>
          <Text style={styles.registerPrompt}>Don't have an account?</Text>
          <Text style={styles.registerLinkBold}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Secure • Trusted • Kenya Chama Platform</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: '800' },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  brandShield: { alignItems: 'center', borderColor: colors.primary, borderRadius: 26, borderWidth: 4, height: 58, justifyContent: 'center', marginBottom: spacing.sm, transform: [{ rotate: '45deg' }], width: 48 },
  brandShieldInner: { alignItems: 'center', transform: [{ rotate: '-45deg' }] },
  brandPeople: { color: colors.primary, fontSize: 16, fontWeight: '900', letterSpacing: -4 },
  brandArc: { color: colors.primary, fontSize: 27, fontWeight: '900', lineHeight: 18, marginTop: -4 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: spacing.xs },
  subtitle: { color: colors.text, fontSize: 16, marginTop: spacing.xs, marginBottom: spacing.sm, textAlign: 'center' },
  form: { maxWidth: 480, width: '100%' },
  fieldLabel: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.sm },
  inputShell: { alignItems: 'center', backgroundColor: colors.white, borderColor: '#B8B8B8', borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', minHeight: 52, paddingHorizontal: spacing.md },
  inputIcon: { color: colors.textMuted, fontSize: 22, fontWeight: '700', marginRight: spacing.sm, width: 24 },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  eyeButton: { paddingLeft: spacing.sm },
  eyeIcon: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  optionsRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  rememberOption: { alignItems: 'center', flexDirection: 'row' },
  checkbox: { alignItems: 'center', borderColor: colors.primary, borderRadius: 4, borderWidth: 1.5, height: 22, justifyContent: 'center', marginRight: spacing.sm, width: 22 },
  checkboxChecked: { backgroundColor: colors.white },
  checkmark: { color: colors.primary, fontSize: 17, fontWeight: '900', lineHeight: 19 },
  rememberText: { color: colors.text, fontSize: 15 },
  forgotLink: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 54,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontSize: 22, fontWeight: '900' },
  registerAction: { alignItems: 'center', marginTop: spacing.md },
  registerPrompt: { color: colors.text, fontSize: 16 },
  registerLinkBold: { color: colors.primary, fontSize: 18, fontWeight: '900', marginTop: spacing.xs, textDecorationLine: 'underline' },
  footer: { color: colors.textMuted, fontSize: 11, marginTop: spacing.md },
});
