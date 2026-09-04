/**
 * ============================================================
 * REGISTER SCREEN
 * ============================================================
 * Step 1 of the auth flow (see docs/AUTH_FLOW.md):
 *   Register -> Verify Email -> Waiting for Chairman -> Login
 *
 * What happens on submit:
 *   1. Validate all fields locally (fast feedback, no network call
 *      wasted on obviously-bad input).
 *   2. Call supabase.auth.signUp() — this creates the auth.users
 *      row AND triggers Supabase's built-in "confirm your email"
 *      system, which we've configured (see docs/SUPABASE_SETUP.md)
 *      to send a 6-DIGIT CODE rather than a magic link, because
 *      members are on shared/borrowed phones. See screen 2/3.
 *   3. The `0002_profile_signup_trigger.sql` migration creates the
 *      matching `profiles` row server-side because no authenticated
 *      session exists while email confirmation is pending.
 *   4. Navigate to VerifyEmail, passing the email along.
 * ============================================================
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { normalizePhone, isValidKenyanPhone } from '../../lib/phone';
import { colors, spacing, radius } from '../../lib/theme';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  // Local form state. Kept as flat useState calls (rather than one
  // big object) so each TextInput re-renders independently —
  // simpler to read for a team member new to the codebase.
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address.';
    if (!isValidKenyanPhone(phone)) {
      return 'Please enter a valid Kenyan phone number (e.g. 0712345678).';
    }
    if (!/^\d{7,8}$/.test(nationalId)) {
      return 'National ID should be 7-8 digits.';
    }
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }

  async function handleRegister() {
    const validationError = validate();
    if (validationError) {
      Alert.alert('Check your details', validationError);
      return;
    }

    setLoading(true);
    try {
      const cleanName = fullName.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanNationalId = nationalId.trim();
      const normalizedPhone = normalizePhone(phone);

      // Supabase sends the 6-digit OTP during signup and stores the
      // user in auth.users. Migration 0002 creates profiles server-side.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: normalizedPhone,
            national_id: cleanNationalId,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) {
        throw new Error('Registration did not return a user. Please try again.');
      }

      navigation.navigate('VerifyEmail', { email: cleanEmail });
    } catch (err: any) {
      Alert.alert('Registration failed', err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thika Road Chama Group{'\n'}Join Us</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Join Thika Road Chama Group today and start saving together
        </Text>

        <Field label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Enter your full name" />
        <Field
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Phone Number (07...)"
          value={phone}
          onChangeText={setPhone}
          placeholder="07..."
          keyboardType="phone-pad"
        />
        <Field
          label="ID Number"
          value={nationalId}
          onChangeText={setNationalId}
          placeholder="Enter your ID number"
          keyboardType="number-pad"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          secureTextEntry={!showPassword}
          onToggleSecure={() => setShowPassword((value) => !value)}
          isSecureVisible={showPassword}
        />
        <Field
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your password"
          secureTextEntry={!showConfirmPassword}
          onToggleSecure={() => setShowConfirmPassword((value) => !value)}
          isSecureVisible={showConfirmPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>
            Already a member? <Text style={styles.loginLinkBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Small reusable labeled input — kept inline in this file since it's
// only used by this screen right now. If Verify/Login end up needing
// the same input style, promote this to src/components/FormField.tsx.
function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  onToggleSecure?: () => void;
  isSecureVisible?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, props.onToggleSecure && styles.secureInput]}
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={props.secureTextEntry}
          keyboardType={props.keyboardType ?? 'default'}
          autoCapitalize={props.autoCapitalize ?? 'sentences'}
        />
        {props.onToggleSecure ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={props.isSecureVisible ? `Hide ${props.label.toLowerCase()}` : `Show ${props.label.toLowerCase()}`}
            onPress={props.onToggleSecure}
            style={styles.showButton}
          >
            <Text style={styles.showButtonText}>{props.isSecureVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingBottom: spacing.xl },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: '700' },
  card: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: { fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  inputRow: { alignItems: 'center', flexDirection: 'row' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  secureInput: { paddingRight: 68 },
  showButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, position: 'absolute', right: 1 },
  showButtonText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  loginLink: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
  loginLinkBold: { color: colors.primary, fontWeight: '700' },
});
