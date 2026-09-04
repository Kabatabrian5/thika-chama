/**
 * ============================================================
 * MEMBER DASHBOARD
 * ============================================================
 * Mobile-first home surface for active chama members. Financial
 * values remain pending until the contributions schema is live;
 * the layout still mirrors the intended product experience.
 * ============================================================
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { supabase } from '../../lib/supabase';
import { colors, radius, spacing } from '../../lib/theme';
import type { MainTabParamList } from '../../navigation/MainNavigator';

type Props = BottomTabScreenProps<MainTabParamList, 'Dashboard'>;

type CardTone = 'green' | 'mint' | 'coral' | 'rose';

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function getNextThursdayDeadline(): Date {
  const now = new Date();
  const eatNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const daysUntilThursday = (4 - eatNow.getUTCDay() + 7) % 7;
  const deadline = new Date(Date.UTC(
    eatNow.getUTCFullYear(),
    eatNow.getUTCMonth(),
    eatNow.getUTCDate() + daysUntilThursday,
    9,
    0,
    0,
  ));

  if (daysUntilThursday === 0 && eatNow.getUTCHours() >= 12) {
    deadline.setUTCDate(deadline.getUTCDate() + 7);
  }

  return deadline;
}

function getCountdown(): Countdown {
  const remaining = Math.max(0, getNextThursdayDeadline().getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

export default function DashboardScreen({ navigation }: Props) {
  const [memberName, setMemberName] = useState('Member');
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<Countdown>(getCountdown);
  const { width } = useWindowDimensions();
  const compactLayout = width < 520;

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        if (mounted) setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userData.user.id)
        .single();

      if (mounted) {
        setMemberName(data?.full_name ?? 'Member');
        setLoading(false);
      }
    }

    loadProfile();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <View style={styles.topCopy}>
          <Text style={styles.brand}>Thika Road{`\n`}Chama Group</Text>
        </View>
        <View style={styles.topActions}><Text style={styles.bell}>♟</Text><View style={styles.profileDot}><Text style={styles.profileInitial}>{memberName.charAt(0).toUpperCase()}</Text></View></View>
      </View>

      <View style={styles.welcomeBand}>
        <View>
          <Text style={styles.bandEyebrow}>WELCOME BACK</Text>
          <Text style={styles.bandName}>{loading ? 'Loading profile...' : memberName}</Text>
        </View>
        <Text style={styles.bandLeaf}>⌁</Text>
      </View>

      <View style={styles.cardsGrid}>
        <SummaryCard label="My Total Savings" value="Pending" tone="green" icon="◉" />
        <SummaryCard label="My Loan Balance" value="Pending" tone="mint" icon="▣" />
        <SummaryCard label="My Fines" value="Pending" tone="coral" icon="!" note="Payment data pending" />
        <SummaryCard label="Welfare" value="Pending" tone="rose" icon="♡" note="Health fund" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Thursday Contribution</Text>
        <Text style={styles.sectionMeta}>KES 2,500 weekly</Text>
      </View>
      <View style={[styles.contributionCard, compactLayout && styles.contributionCardCompact]}>
        <ContributionState icon="✓" label="Status" value="Awaiting payment data" tone="paid" />
        <View style={[styles.divider, compactLayout && styles.dividerCompact]} />
        <View style={styles.countdownBlock}>
          <Text style={styles.stateLabel}>TIME TO DEADLINE</Text>
          <Text style={styles.countdownValue}>{countdown.days}d {twoDigits(countdown.hours)}:{twoDigits(countdown.minutes)}:{twoDigits(countdown.seconds)}</Text>
          <Text style={styles.stateValue}>Thursday, 12:00 PM EAT</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, styles.quickTitle]}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <QuickAction icon="＋" label="Contribute Now" filled onPress={() => navigation.navigate('Contribute')} />
        <QuickAction icon="▤" label="Request Loan" onPress={() => navigation.navigate('Loans')} />
        <QuickAction icon="▥" label="My Receipts" onPress={() => navigation.navigate('Profile')} />
      </View>

      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Text style={styles.pendingCaption}>Coming soon</Text>
      </View>
      <View style={styles.emptyState}>
        {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.emptyTitle}>No transactions yet</Text>}
        <Text style={styles.emptyBody}>Confirmed M-Pesa payments will appear here.</Text>
      </View>
    </ScrollView>
  );
}

function SummaryCard({ label, value, icon, tone, note }: { label: string; value: string; icon: string; tone: CardTone; note?: string }) {
  return (
    <View style={[styles.summaryCard, styles[`card_${tone}`]]}>
      <View style={styles.cardTop}><View style={styles.cardIcon}><Text style={styles.cardIconText}>{icon}</Text></View><Text style={styles.cardArrow}>›</Text></View>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {note ? <Text style={styles.cardNote}>{note}</Text> : null}
    </View>
  );
}

function ContributionState({ icon, label, value, tone }: { icon: string; label: string; value: string; tone: 'paid' | 'pending' }) {
  return <View style={styles.contributionState}><View style={[styles.stateIcon, tone === 'pending' && styles.stateIconPending]}><Text style={styles.stateIconText}>{icon}</Text></View><View><Text style={styles.stateLabel}>{label}</Text><Text style={styles.stateValue}>{value}</Text></View></View>;
}

function QuickAction({ icon, label, filled, onPress }: { icon: string; label: string; filled?: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.quickAction, filled && styles.quickActionFilled]}><Text style={[styles.quickIcon, filled && styles.quickIconFilled]}>{icon}</Text><Text style={[styles.quickLabel, filled && styles.quickLabelFilled]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F4F8F5', flex: 1 },
  content: { alignSelf: 'center', maxWidth: 760, padding: spacing.lg, paddingBottom: 36, width: '100%' },
  topBar: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  topCopy: { flex: 1, minWidth: 0 },
  brand: { color: colors.primaryDark, fontSize: 21, fontWeight: '900', lineHeight: 23 },
  topActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  bell: { color: colors.primary, fontSize: 25 },
  profileDot: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 24, height: 48, justifyContent: 'center', marginLeft: spacing.sm, width: 48 },
  profileInitial: { color: colors.white, fontSize: 20, fontWeight: '900' },
  welcomeBand: { alignItems: 'center', backgroundColor: '#DDF3DD', borderRadius: radius.lg, flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, padding: spacing.md },
  bandEyebrow: { color: '#5A7A64', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  bandName: { color: colors.primaryDark, fontSize: 19, fontWeight: '900', marginTop: 2 },
  bandLeaf: { color: colors.primary, fontSize: 42, fontWeight: '300', transform: [{ rotate: '-35deg' }] },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  summaryCard: { borderRadius: radius.lg, minHeight: 152, padding: spacing.md, width: 'calc(50% - 4px)' as any },
  card_green: { backgroundColor: '#BFF3B7' },
  card_mint: { backgroundColor: '#D9F4F0' },
  card_coral: { backgroundColor: '#FFD4D0' },
  card_rose: { backgroundColor: '#DDF4E0' },
  cardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  cardIcon: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.42)', borderRadius: 18, height: 34, justifyContent: 'center', width: 34 },
  cardIconText: { color: colors.primaryDark, fontSize: 17, fontWeight: '900' },
  cardArrow: { color: 'rgba(10,77,37,0.55)', fontSize: 27, fontWeight: '300' },
  cardLabel: { color: '#496352', fontSize: 13, marginTop: spacing.md },
  cardValue: { color: colors.primaryDark, fontSize: 22, fontWeight: '900', marginTop: spacing.xs },
  cardNote: { color: '#8D3940', fontSize: 11, marginTop: spacing.xs },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  sectionTitle: { color: colors.primaryDark, fontSize: 18, fontWeight: '900' },
  sectionMeta: { color: colors.textMuted, fontSize: 12 },
  contributionCard: { alignItems: 'center', backgroundColor: colors.white, borderColor: '#C8DED0', borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.sm, padding: spacing.md },
  contributionCardCompact: { alignItems: 'stretch', flexDirection: 'column', padding: spacing.lg },
  contributionState: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing.sm, minWidth: 0 },
  stateIcon: { alignItems: 'center', backgroundColor: colors.success, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  stateIconPending: { backgroundColor: '#FFE19A' },
  stateIconText: { color: colors.white, fontSize: 20, fontWeight: '900' },
  stateLabel: { color: colors.textMuted, fontSize: 11 },
  stateValue: { color: colors.text, fontSize: 12, fontWeight: '800', marginTop: 2 },
  countdownBlock: { flex: 1, minWidth: 0 },
  countdownValue: { color: colors.primaryDark, fontSize: 17, fontWeight: '900', marginTop: 2 },
  divider: { backgroundColor: '#DCE9E0', height: 42, width: 1 },
  dividerCompact: { height: 1, marginVertical: spacing.md, width: '100%' },
  quickTitle: { marginTop: spacing.lg },
  quickActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  quickAction: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.primary, borderRadius: radius.md, borderWidth: 1.5, flex: 1, minHeight: 88, justifyContent: 'center', padding: spacing.sm },
  quickActionFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  quickIcon: { color: colors.primary, fontSize: 25, fontWeight: '700' },
  quickIconFilled: { color: colors.white },
  quickLabel: { color: colors.primaryDark, fontSize: 12, fontWeight: '800', marginTop: spacing.xs, textAlign: 'center' },
  quickLabelFilled: { color: colors.white },
  recentHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  pendingCaption: { color: colors.textMuted, fontSize: 12 },
  emptyState: { alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, marginTop: spacing.sm, padding: spacing.lg },
  emptyTitle: { color: colors.text, fontWeight: '800' },
  emptyBody: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs, textAlign: 'center' },
});
