/**
 * ============================================================
 * CONTRIBUTE SCREEN
 * ============================================================
 * Reading-mode payment instructions for the chama. Members pay
 * through the approved bank/M-Pesa channel; confirmation and
 * allocation will be connected to server records later.
 * ============================================================
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors, radius, spacing } from '../../lib/theme';
import type { MainTabParamList } from '../../navigation/MainNavigator';

type Props = BottomTabScreenProps<MainTabParamList, 'Contribute'>;

export default function ContributeScreen({ navigation }: Props) {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((value) => value === 1 ? 5 : value - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>THIKA ROAD CHAMA GROUP</Text>
          <Text style={styles.title}>Contribute Now</Text>
          <Text style={styles.subtitle}>Pay manually. We confirm it securely.</Text>
        </View>
        <View style={styles.readingBadge}><Text style={styles.readingDot}>●</Text><Text style={styles.readingText}>READING</Text></View>
      </View>

      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>WEEKLY CONTRIBUTION</Text>
        <Text style={styles.amount}>KES 2,500</Text>
        <Text style={styles.amountHint}>KES 2,000 savings  •  KES 500 welfare</Text>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>How to pay</Text>
        <Text style={styles.secureLabel}>● Secure</Text>
      </View>
      <View style={styles.instructionCard}>
        <InstructionStep number="1" title="Open M-Pesa" body="Go to Lipa na M-Pesa, then Paybill." />
        <InstructionStep number="2" title="Use the approved Paybill" body="Enter the chama Paybill and your registered account reference." />
        <InstructionStep number="3" title="Pay KES 2,500" body="Complete the payment from your registered phone number." />
      </View>

      <View style={styles.paybillCard}>
        <Text style={styles.paybillLabel}>PAYBILL DETAILS</Text>
        <View style={styles.detailRow}><Text style={styles.detailName}>Paybill number</Text><Text style={styles.detailValue}>Confirm with Treasurer</Text></View>
        <View style={styles.detailLine} />
        <View style={styles.detailRow}><Text style={styles.detailName}>Account reference</Text><Text style={styles.detailValue}>Your registered name</Text></View>
        <Text style={styles.paybillNote}>The final Paybill details will be enabled after bank confirmation.</Text>
      </View>

      <View style={styles.linkedCard}>
        <View style={styles.phoneIcon}><Text style={styles.phoneGlyph}>⌁</Text></View>
        <View style={styles.linkedCopy}><Text style={styles.linkedLabel}>Linked payment phone</Text><Text style={styles.linkedValue}>Your registered phone number</Text></View>
        <Text style={styles.lock}>✓</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}><Text style={styles.statusTitle}>Waiting for confirmation</Text><View style={styles.spinner}><ActivityIndicator color={colors.primary} size="small" /></View></View>
        <Text style={styles.statusBody}>After paying, keep this screen open. We will check for a confirmed bank payment automatically.</Text>
        <View style={styles.pollRow}><Text style={styles.pollText}>Next check in {seconds}s</Text><Text style={styles.pollPending}>No payment found yet</Text></View>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeIcon}>!</Text>
        <View style={styles.noticeCopy}><Text style={styles.noticeTitle}>Have a fine or loan?</Text><Text style={styles.noticeBody}>Confirmed payments are allocated according to the chama rules.</Text></View>
        <Pressable onPress={() => navigation.navigate('Loans')}><Text style={styles.noticeLink}>View</Text></Pressable>
      </View>

      <Pressable style={styles.backAction} onPress={() => navigation.navigate('Dashboard')}><Text style={styles.backText}>Back to dashboard</Text></Pressable>
    </ScrollView>
  );
}

function InstructionStep({ number, title, body }: { number: string; title: string; body: string }) {
  return <View style={styles.step}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{number}</Text></View><View style={styles.stepCopy}><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepBody}>{body}</Text></View></View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F4F8F5', flex: 1 },
  content: { alignSelf: 'center', maxWidth: 760, padding: spacing.lg, paddingBottom: 40, width: '100%' },
  headerRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.primaryDark, fontSize: 30, fontWeight: '900', marginTop: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs },
  readingBadge: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: radius.pill, flexDirection: 'row', marginLeft: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 7 },
  readingDot: { color: colors.success, fontSize: 10, marginRight: 5 },
  readingText: { color: colors.primaryDark, fontSize: 10, fontWeight: '900' },
  amountCard: { backgroundColor: colors.primary, borderRadius: radius.lg, marginTop: spacing.lg, padding: spacing.lg },
  amountLabel: { color: '#BEE8C9', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  amount: { color: colors.white, fontSize: 34, fontWeight: '900', marginTop: spacing.xs },
  amountHint: { color: '#E5F6E9', fontSize: 13, marginTop: spacing.xs },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  sectionTitle: { color: colors.primaryDark, fontSize: 19, fontWeight: '900' },
  secureLabel: { color: colors.success, fontSize: 12, fontWeight: '800' },
  instructionCard: { backgroundColor: colors.white, borderRadius: radius.lg, marginTop: spacing.sm, padding: spacing.md },
  step: { alignItems: 'flex-start', flexDirection: 'row', marginVertical: spacing.sm },
  stepNumber: { alignItems: 'center', backgroundColor: '#DDF3DD', borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
  stepNumberText: { color: colors.primaryDark, fontWeight: '900' },
  stepCopy: { flex: 1, marginLeft: spacing.sm },
  stepTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  stepBody: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  paybillCard: { backgroundColor: '#EAF6EA', borderColor: '#B8DDBB', borderRadius: radius.lg, borderWidth: 1, marginTop: spacing.md, padding: spacing.md },
  paybillLabel: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  detailRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  detailName: { color: '#55705D', fontSize: 13 },
  detailValue: { color: colors.primaryDark, fontSize: 13, fontWeight: '900', maxWidth: '60%', textAlign: 'right' },
  detailLine: { backgroundColor: '#D1E7D3', height: 1, marginTop: spacing.md },
  paybillNote: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: spacing.md },
  linkedCard: { alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, flexDirection: 'row', marginTop: spacing.md, padding: spacing.md },
  phoneIcon: { alignItems: 'center', backgroundColor: '#E7F4E8', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  phoneGlyph: { color: colors.primary, fontSize: 25 },
  linkedCopy: { flex: 1, marginLeft: spacing.sm },
  linkedLabel: { color: colors.textMuted, fontSize: 12 },
  linkedValue: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 2 },
  lock: { color: colors.success, fontSize: 20, fontWeight: '900' },
  statusCard: { backgroundColor: colors.white, borderColor: '#C9DFD0', borderRadius: radius.lg, borderWidth: 1, marginTop: spacing.md, padding: spacing.md },
  statusHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statusTitle: { color: colors.primaryDark, fontSize: 16, fontWeight: '900' },
  spinner: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 18, height: 34, justifyContent: 'center', width: 34 },
  statusBody: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  pollRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  pollText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  pollPending: { color: colors.textMuted, fontSize: 11 },
  noticeCard: { alignItems: 'center', backgroundColor: '#FFF8E8', borderColor: '#F0D995', borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', marginTop: spacing.md, padding: spacing.md },
  noticeIcon: { alignItems: 'center', backgroundColor: '#F7D87B', borderRadius: 15, color: '#755800', fontSize: 18, fontWeight: '900', height: 30, lineHeight: 30, textAlign: 'center', width: 30 },
  noticeCopy: { flex: 1, marginLeft: spacing.sm },
  noticeTitle: { color: '#755800', fontSize: 13, fontWeight: '900' },
  noticeBody: { color: '#806F3A', fontSize: 12, lineHeight: 17, marginTop: 2 },
  noticeLink: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  backAction: { alignItems: 'center', marginTop: spacing.lg, padding: spacing.sm },
  backText: { color: colors.primary, fontSize: 13, fontWeight: '900' },
});
