/**
 * ============================================================
 * TEMPORARY PLACEHOLDER
 * ============================================================
 * This stands in for the real Dashboard until Step 3 of the
 * build order (see docs/BUILD_ORDER.md). It exists so that the
 * full Register -> Verify -> Approval -> Login flow is testable
 * end-to-end RIGHT NOW, without waiting for the dashboard to be
 * built. Delete this file once DashboardScreen.tsx replaces it
 * in MainNavigator.tsx.
 * ============================================================
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, spacing } from '../../lib/theme';

export default function DashboardPlaceholder() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>🎉 You're in!</Text>
      <Text style={styles.body}>
        This confirms the full auth flow works: Register → Verify Email → Chairman
        Approval → Login → here.
      </Text>
      <Text style={styles.body}>Real Dashboard/Members/Contribute/Loans/Profile screens are Step 3.</Text>
      <TouchableOpacity style={styles.button} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '800', marginBottom: spacing.md },
  body: { textAlign: 'center', color: colors.textMuted, marginBottom: spacing.sm },
  button: { marginTop: spacing.lg, backgroundColor: colors.danger, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 8 },
  buttonText: { color: colors.white, fontWeight: '700' },
});
