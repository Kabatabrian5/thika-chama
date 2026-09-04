/**
 * ============================================================
 * MEMBERS DIRECTORY
 * ============================================================
 * Provides the member directory for authenticated users. Chairman
 * and treasurer accounts also receive protected approve, reject,
 * and remove actions for pending or unwanted registrations.
 * ============================================================
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, radius, spacing } from '../../lib/theme';
import { getDefaultAvatarUrl } from '../../lib/defaultAvatar';

type Member = { id: string; full_name: string; phone: string; status: string; role: string };

export default function MembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentRole, setCurrentRole] = useState('member');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  async function loadMembers(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? '';
    const { data: profile } = userId
      ? await supabase.from('profiles').select('role').eq('id', userId).single()
      : { data: null };
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, phone, status, role')
      .order('full_name');
    setMembers(data ?? []);
    setCurrentUserId(userId);
    setCurrentRole(profile?.role ?? 'member');
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    let mounted = true;

    loadMembers().finally(() => {
      if (!mounted) return;
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function manageMember(member: Member, action: 'approve' | 'reject' | 'delete') {
    const labels = { approve: 'approve', reject: 'reject', delete: 'remove' };
    setActionMessage('');
    setActionError('');
    const runAction = async () => {
          const { error } = await supabase.rpc('manage_member', {
            target_user_id: member.id,
            action,
          });
          if (error) {
            setActionError(error.message);
            Alert.alert('Action failed', error.message);
            return;
          }

          const { data: updatedMember, error: verificationError } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', member.id)
            .single();

          if (verificationError) {
            setActionError(`The action completed, but the updated member could not be verified: ${verificationError.message}`);
            await loadMembers(true);
            return;
          }

          if (action === 'approve' && updatedMember.status !== 'ACTIVE') {
            setActionError(`Approval did not change ${member.full_name} to ACTIVE. Apply migrations 0004 and 0006 in Supabase, then try again.`);
            await loadMembers(true);
            return;
          }

          setMembers((currentMembers) => currentMembers.map((currentMember) => (
            currentMember.id === member.id
              ? { ...currentMember, status: action === 'approve' ? 'ACTIVE' : action === 'reject' ? 'REJECTED' : currentMember.status }
              : currentMember
          )));
          await loadMembers(true);
          setActionMessage(`${member.full_name} was ${action === 'delete' ? 'removed' : `${action}d`}.`);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to ${labels[action]} ${member.full_name}?`)) {
        await runAction();
      }
      return;
    }

    Alert.alert(`${labels[action].charAt(0).toUpperCase()}${labels[action].slice(1)} member`, `Are you sure you want to ${labels[action]} ${member.full_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: labels[action].charAt(0).toUpperCase() + labels[action].slice(1),
        style: action === 'delete' || action === 'reject' ? 'destructive' : 'default',
        onPress: runAction,
      },
    ]);
  }

  const canManageMembers = currentRole === 'chairman' || currentRole === 'treasurer';

  const filteredMembers = members.filter((member) => member.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>THIKA ROAD CHAMA GROUP</Text>
        <Text style={styles.title}>Members</Text>
        <Text style={styles.subtitle}>{members.length || 15} member directory</Text>
        <TextInput style={styles.search} value={search} onChangeText={setSearch} placeholder="Search members" placeholderTextColor={colors.textMuted} />
        {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}
        {actionMessage ? <Text style={styles.successText}>{actionMessage}</Text> : null}
      </View>

      {loading ? <ActivityIndicator style={styles.loader} color={colors.primary} /> : <FlatList
        data={filteredMembers}
        keyExtractor={(member) => member.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => loadMembers(true)}
        ListEmptyComponent={<Text style={styles.empty}>No members match your search.</Text>}
        renderItem={({ item }) => <View style={styles.memberRow}>
          <View style={styles.avatar}>
            <Image source={{ uri: getDefaultAvatarUrl(item.full_name) }} style={styles.avatarImage} />
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{item.full_name}</Text>
            <Text style={styles.memberPhone}>{item.phone}</Text>
          </View>
          <View style={styles.memberRight}>
            <Text style={[styles.status, item.status === 'ACTIVE' ? styles.active : styles.pending]}>{item.status === 'ACTIVE' ? 'Active' : item.status === 'REJECTED' ? 'Rejected' : 'Pending'}</Text>
            {canManageMembers && item.id !== currentUserId ? (
              <View style={styles.actions}>
                {item.status === 'PENDING_APPROVAL' ? <>
                  <TouchableOpacity onPress={() => manageMember(item, 'approve')} style={styles.approveButton}><Text style={styles.actionText}>Approve</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => manageMember(item, 'reject')} style={styles.rejectButton}><Text style={styles.actionText}>Reject</Text></TouchableOpacity>
                </> : item.status === 'ACTIVE' ? <Text style={styles.approvedText}>Approved</Text> : null}
                <TouchableOpacity onPress={() => manageMember(item, 'delete')} style={styles.deleteButton}><Text style={styles.actionText}>Remove</Text></TouchableOpacity>
              </View>
            ) : null}
          </View>
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
  avatarImage: { borderRadius: 22, height: 44, width: 44 },
  memberDetails: { flex: 1, marginLeft: spacing.md },
  memberName: { color: colors.text, fontWeight: '700' },
  memberPhone: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  status: { fontSize: 12, fontWeight: '700' },
  active: { color: colors.success },
  pending: { color: colors.warning },
  memberRight: { alignItems: 'flex-end', marginLeft: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', marginTop: spacing.xs, maxWidth: 190 },
  approveButton: { backgroundColor: colors.primaryLight, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  rejectButton: { backgroundColor: '#FFF4E5', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  deleteButton: { backgroundColor: '#FFF0F0', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  actionText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  approvedText: { color: colors.success, fontSize: 11, fontWeight: '800', marginTop: spacing.xs },
  errorText: { backgroundColor: '#FFF0F0', borderColor: '#F3B5B5', borderRadius: radius.sm, borderWidth: 1, color: colors.danger, fontSize: 13, marginTop: spacing.sm, padding: spacing.sm },
  successText: { backgroundColor: colors.primaryLight, borderColor: '#B4D5B0', borderRadius: radius.sm, borderWidth: 1, color: colors.primaryDark, fontSize: 13, marginTop: spacing.sm, padding: spacing.sm },
  loader: { marginTop: spacing.xl },
  empty: { color: colors.textMuted, padding: spacing.lg, textAlign: 'center' },
});