/**
 * ============================================================
 * PROFILE SCREEN
 * ============================================================
 * Member profile surface based on the approved Edit Profile
 * reference. Name and phone are editable through the existing
 * profiles table; email and national ID remain locked identity
 * fields. Photo upload is reserved for the storage step.
 * ============================================================
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { displayPhone, isValidKenyanPhone, normalizePhone } from '../../lib/phone';
import { colors, radius, spacing } from '../../lib/theme';

export default function ProfileScreen() {
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, national_id, role')
        .eq('id', user.id)
        .single();

      if (!mounted) return;
      if (error || !data) {
        setErrorMessage(error?.message ?? 'Could not load your profile.');
      } else {
        setUserId(data.id);
        setFullName(data.full_name);
        setEmail(data.email);
        setPhone(displayPhone(data.phone));
        setNationalId(data.national_id);
        setRole(data.role);
      }
      setLoading(false);
    }

    loadProfile();
    return () => { mounted = false; };
  }, []);

  async function handleSave() {
    setMessage('');
    setErrorMessage('');
    const cleanName = fullName.trim();
    const cleanPhone = normalizePhone(phone);

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!isValidKenyanPhone(phone)) {
      setErrorMessage('Please enter a valid Kenyan phone number.');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: cleanName, phone: cleanPhone })
      .eq('id', userId);
    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setFullName(cleanName);
    setPhone(displayPhone(cleanPhone));
    setMessage('Your profile changes have been saved.');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const initials = fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TR';

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.backGlyph}>‹</Text>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.brandArea}>
        <Text style={styles.brand}>Thika Road Chama Group</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Change profile photo" onPress={() => Alert.alert('Photo upload', 'Profile photo upload will be added with secure storage.') } style={styles.avatarButton}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={styles.camera}><Text style={styles.cameraText}>●</Text></View>
        </Pressable>
        <Text style={styles.photoHint}>Tap to change photo</Text>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {message ? <Text style={styles.successText}>{message}</Text> : null}

      <Field label="Full Name" value={fullName} onChangeText={setFullName} />
      <LockedField label="Email" value={email} icon="▣" />
      <Field label="Phone" value={phone} onChangeText={(value) => setPhone(value.replace(/\D/g, '').slice(0, 19))} keyboardType="phone-pad" />
      <LockedField label="National ID" value={nationalId} badge="Verified" icon="◆" />

      <View style={styles.roleRow}><Text style={styles.roleLabel}>Account role</Text><Text style={styles.roleValue}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text></View>

      <Pressable onPress={handleSave} disabled={saving} style={[styles.saveButton, saving && styles.disabled]}>
        {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveText}>Save Changes</Text>}
      </Pressable>
      <Text style={styles.footer}>Changes will update across Thika Road Chama Group</Text>

      <Pressable onPress={handleLogout} style={styles.logoutButton}><Text style={styles.logoutText}>Log out</Text></Pressable>
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'phone-pad' }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} style={styles.input} keyboardType={keyboardType} placeholderTextColor={colors.textMuted} /></View>;
}

function LockedField({ label, value, icon, badge }: { label: string; value: string; icon: string; badge?: string }) {
  return <View style={styles.field}><View style={styles.labelRow}><Text style={styles.label}>{label}</Text>{badge ? <View style={styles.verified}><Text style={styles.verifiedText}>✓ {badge}</Text></View> : null}</View><View style={styles.lockedInput}><Text style={styles.lockedValue}>{value}</Text><Text style={styles.lockIcon}>{icon}</Text></View></View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F7FAF8', flex: 1 },
  content: { alignSelf: 'center', maxWidth: 620, paddingBottom: 40, width: '100%' },
  loading: { alignItems: 'center', backgroundColor: '#F7FAF8', flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', backgroundColor: colors.white, borderBottomColor: '#E5ECE7', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 54, paddingBottom: spacing.md },
  backGlyph: { color: colors.text, fontSize: 42, fontWeight: '300', lineHeight: 38, width: 48 },
  headerTitle: { color: colors.primaryDark, fontSize: 28, fontWeight: '900' },
  headerSpacer: { width: 48 },
  brandArea: { alignItems: 'center', padding: spacing.lg },
  brand: { color: '#637B6B', fontSize: 15, marginBottom: spacing.md },
  avatarButton: { position: 'relative' },
  avatar: { alignItems: 'center', backgroundColor: '#A7D7AD', borderColor: colors.primary, borderRadius: 76, borderWidth: 4, height: 142, justifyContent: 'center', width: 142 },
  avatarText: { color: colors.primaryDark, fontSize: 42, fontWeight: '900' },
  camera: { alignItems: 'center', backgroundColor: colors.primary, borderColor: colors.white, borderRadius: 25, borderWidth: 4, bottom: 2, height: 50, justifyContent: 'center', position: 'absolute', right: -3, width: 50 },
  cameraText: { color: colors.white, fontSize: 20 },
  photoHint: { color: '#637B6B', fontSize: 14, marginTop: spacing.sm },
  field: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  labelRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  label: { color: '#3E5145', fontSize: 15, marginBottom: spacing.xs },
  input: { backgroundColor: colors.white, borderColor: '#87978D', borderRadius: radius.md, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 52, paddingHorizontal: spacing.md },
  lockedInput: { alignItems: 'center', backgroundColor: '#F0F2F1', borderColor: '#AAB4AE', borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 52, paddingHorizontal: spacing.md },
  lockedValue: { color: '#758078', flex: 1, fontSize: 16 },
  lockIcon: { color: '#79847D', fontSize: 18 },
  verified: { backgroundColor: '#DDF3DD', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  verifiedText: { color: colors.success, fontSize: 11, fontWeight: '800' },
  roleRow: { alignItems: 'center', borderBottomColor: '#E0E9E2', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: spacing.lg, marginTop: spacing.lg, paddingBottom: spacing.md },
  roleLabel: { color: colors.textMuted, fontSize: 14 },
  roleValue: { color: colors.primaryDark, fontSize: 14, fontWeight: '900' },
  errorText: { backgroundColor: '#FFF0F0', borderColor: '#F3B5B5', borderRadius: radius.sm, borderWidth: 1, color: colors.danger, marginHorizontal: spacing.lg, marginTop: spacing.sm, padding: spacing.sm },
  successText: { backgroundColor: '#EAF6EA', borderColor: '#B8DDBB', borderRadius: radius.sm, borderWidth: 1, color: colors.primaryDark, marginHorizontal: spacing.lg, marginTop: spacing.sm, padding: spacing.sm },
  saveButton: { alignItems: 'center', backgroundColor: '#159447', borderRadius: radius.md, justifyContent: 'center', marginHorizontal: spacing.lg, marginTop: spacing.xl, minHeight: 56 },
  disabled: { opacity: 0.65 },
  saveText: { color: colors.white, fontSize: 18, fontWeight: '900' },
  footer: { color: colors.textMuted, fontSize: 12, marginTop: spacing.md, textAlign: 'center' },
  logoutButton: { alignItems: 'center', marginTop: spacing.lg, padding: spacing.sm },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '800' },
});
