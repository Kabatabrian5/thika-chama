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
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radius } from '../../lib/theme';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thika Road Chama Group</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.shieldCircle}>
          <Text style={{ fontSize: 32 }}>🛡️</Text>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to your chama account</Text>

        <Text style={styles.fieldLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.fieldLabel}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeButton}>
            <Text>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Text style={styles.forgotLink}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>
            Don't have an account? <Text style={styles.registerLinkBold}>Register</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>🇰🇪 Secure • Trusted • Kenya Chama Platform</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { backgroundColor: colors.primary, paddingTop: 60, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },
  content: { padding: spacing.lg, alignItems: 'center' },
  shieldCircle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg, textAlign: 'center' },
  fieldLabel: { alignSelf: 'flex-start', fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  eyeButton: { padding: spacing.sm },
  forgotLink: { alignSelf: 'flex-end', color: colors.primary, fontWeight: '600', marginTop: spacing.xs },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  registerLink: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
  registerLinkBold: { color: colors.primary, fontWeight: '700' },
  footer: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xl },
});
