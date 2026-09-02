/**
 * ============================================================
 * MEMBER DASHBOARD
 * ============================================================
 * Step 3 establishes the information hierarchy for an ACTIVE
 * member. Financial totals stay pending until the contributions
 * migration exists; the client must never fabricate balances.
 * ============================================================
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, radius, spacing } from '../../lib/theme';

export default function DashboardScreen() {
  const [memberName, setMemberName] = useState('Member');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        if (mounted) setLoading(false);
        return;
      }

      const { data } = await supabase.from('profiles').select('full_name').eq('id', userData.user.id).single();
      if (mounted) {
        setMemberName(data?.full_name ?? 'Member');
        setLoading(false);
      }
    }

    loadProfile();
    return () => { mounted = false; };
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>THIKA ROAD CHAMA GROUP</Text>
      <Text style={styles.title}>Welcome, {loading ? '...' : memberName}</Text>
      <Text style={styles.subtitle}>Your weekly savings at a glance</Text>

      <View style={styles.deadlineCard}>
        <Text style={styles.deadlineLabel}>NEXT CONTRIBUTION DEADLINE</Text>
        <Text style={styles.deadlineValue}>Thursday, 12:00 PM EAT</Text>
        <Text style={styles.deadlineHint}>Weekly contribution: KES 2,500</Text>
      </View>

      <View style={styles.cardsGrid}>
        <SummaryCard label="Total Savings" value="Pending" color={colors.success} />
        <SummaryCard label="My Fines" value="Pending" color={colors.danger} />
        <SummaryCard label="Welfare" value="Pending" color="#2D6CDF" />
        <SummaryCard label="Group Savings" value="Pending" color={colors.primaryDark} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent transactions</Text>
        <View style={styles.emptyState}>
          {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.emptyTitle}>No transactions yet</Text>}
          <Text style={styles.emptyBody}>Payment history will appear after the contributions table is connected.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return <View style={styles.summaryCard}>
    <View style={[styles.cardAccent, { backgroundColor: color }]} />
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: 56, paddingBottom: spacing.xl },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: spacing.xs },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs },
  deadlineCard: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg },
  deadlineLabel: { color: '#CDEBD8', fontSize: 11, fontWeight: '800' },
  deadlineValue: { color: colors.white, fontSize: 20, fontWeight: '800', marginTop: spacing.xs },
  deadlineHint: { color: '#E8F5EC', marginTop: spacing.xs },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  summaryCard: { backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.md, width: '48%', minHeight: 112, position: 'relative', overflow: 'hidden' },
  cardAccent: { height: 4, left: 0, position: 'absolute', right: 0, top: 0 },
  cardLabel: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  cardValue: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: spacing.sm },
  section: { marginTop: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  emptyState: { alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.sm, marginTop: spacing.sm, padding: spacing.lg },
  emptyTitle: { color: colors.text, fontWeight: '700' },
  emptyBody: { color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
});