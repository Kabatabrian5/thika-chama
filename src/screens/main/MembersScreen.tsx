/**
 * ============================================================
 * MEMBERS DIRECTORY
 * ============================================================
 * Step 3 provides a read-only directory for authenticated users.
 * It reads only the profile fields needed for the list. Payment
 * status will be added when the contributions table exists.
 * ============================================================
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, radius, spacing } from '../../lib/theme';

type Member = { id: string; full_name: string; phone: string; status: string };

export default function MembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadMembers() {
      const { data } = await supabase.from('profiles').select('id, full_name, phone, status').order('full_name');
      if (mounted) {
        setMembers(data ?? []);
        setLoading(false);
      }
    }

    loadMembers();
    return () => { mounted = false; };
  }, []);

  const filteredMembers = members.filter((member) => member.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>THIKA ROAD CHAMA GROUP</Text>
        <Text style={styles.title}>Members</Text>
        <Text style={styles.subtitle}>{members.length || 15} member directory</Text>
        <TextInput style={styles.search} value={search} onChangeText={setSearch} placeholder="Search members" placeholderTextColor={colors.textMuted} />
      </View>

      {loading ? <ActivityIndicator style={styles.loader} color={colors.primary} /> : <FlatList
        data={filteredMembers}
        keyExtractor={(member) => member.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No members match your search.</Text>}
        renderItem={({ item }) => <View style={styles.memberRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{item.full_name.charAt(0).toUpperCase()}</Text></View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{item.full_name}</Text>
            <Text style={styles.memberPhone}>{item.phone}</Text>
          </View>
          <Text style={[styles.status, item.status === 'ACTIVE' ? styles.active : styles.pending]}>{item.status === 'ACTIVE' ? 'Active' : 'Pending'}</Text>
        </View>}
      />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.white, padding: spacing.lg, paddingTop: 56 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: spacing.xs },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs },
  search: { backgroundColor: colors.background, borderRadius: radius.sm, color: colors.text, marginTop: spacing.md, padding: spacing.md },
  list: { padding: spacing.md },
  memberRow: { alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.sm, flexDirection: 'row', marginBottom: spacing.sm, padding: spacing.md },
  avatar: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  avatarText: { color: colors.primaryDark, fontSize: 18, fontWeight: '800' },
  memberDetails: { flex: 1, marginLeft: spacing.md },
  memberName: { color: colors.text, fontWeight: '700' },
  memberPhone: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  status: { fontSize: 12, fontWeight: '700' },
  active: { color: colors.success },
  pending: { color: colors.warning },
  loader: { marginTop: spacing.xl },
  empty: { color: colors.textMuted, padding: spacing.lg, textAlign: 'center' },
});