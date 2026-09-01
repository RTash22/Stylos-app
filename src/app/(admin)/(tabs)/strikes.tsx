/**
 * Admin — Strikes Management
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers';
import { useMutationGuard } from '@/hooks';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET, STRIKE_THRESHOLD } from '@/constants';
import { ConfirmActionDialog, LoadingSkeleton, EmptyState } from '@/components/ui';
import type { Client } from '@/types';

export default function AdminStrikesScreen() {
  const { profile } = useAuth();
  const { isMutating, guard } = useMutationGuard();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearDialog, setClearDialog] = useState<{ visible: boolean; client: Client | null }>({ visible: false, client: null });

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').gt('strikes', 0).order('strikes', { ascending: false });
    setClients((data as Client[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => { setRefreshing(true); await fetch(); setRefreshing(false); }, [fetch]);

  const handleClearStrikes = useCallback(async () => {
    const client = clearDialog.client;
    if (!client) return;
    await guard(async () => {
      // Record the clearing in strike_records
      await supabase.from('strike_records').insert({
        client_id: client.id,
        reason: 'Limpieza administrativa',
        cleared_by: profile?.id,
        cleared_at: new Date().toISOString(),
        cleared_reason: 'Limpieza administrativa',
        previous_count: client.strikes,
      });
      // Reset strikes
      const { error } = await supabase.from('clients').update({ strikes: 0, requires_deposit: false }).eq('id', client.id);
      if (error) Alert.alert('Error', error.message);
      else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await fetch();
      }
      setClearDialog({ visible: false, client: null });
    });
  }, [clearDialog.client, guard, profile, fetch]);

  const renderClient = ({ item }: { item: Client }) => (
    <View style={[styles.card, shadows.sm]}>
      <View style={styles.clientRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.full_name[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.full_name}</Text>
          <View style={styles.strikeRow}>
            <MaterialCommunityIcons name="alert" size={14} color={colors.danger} />
            <Text style={styles.strikeCount}>
              {item.strikes} strike{item.strikes > 1 ? 's' : ''}
              {item.strikes >= STRIKE_THRESHOLD ? ' · Requiere anticipo' : ''}
            </Text>
          </View>
        </View>
        <Pressable
          style={styles.clearBtn}
          onPress={() => setClearDialog({ visible: true, client: item })}
        >
          <MaterialCommunityIcons name="eraser" size={20} color={colors.oliveGold} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Strikes</Text>
      </View>

      {loading ? (
        <View style={styles.pad}>{[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={72} />)}</View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          renderItem={renderClient}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.walnut} />}
          ListEmptyComponent={<EmptyState icon="check-circle-outline" title="Sin strikes" message="Ningún cliente tiene strikes pendientes." />}
        />
      )}

      <ConfirmActionDialog
        visible={clearDialog.visible}
        title="Limpiar strikes"
        message={`¿Limpiar los ${clearDialog.client?.strikes ?? 0} strikes de ${clearDialog.client?.full_name ?? ''}? Esta acción quedará registrada.`}
        confirmLabel="Limpiar"
        loading={isMutating}
        onConfirm={handleClearStrikes}
        onCancel={() => setClearDialog({ visible: false, client: null })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1, color: colors.graphite },
  pad: { paddingHorizontal: spacing.xl, gap: spacing.md },
  list: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing['3xl'] },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FCEAE8', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.callout, color: colors.danger },
  info: { flex: 1 },
  name: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.body, color: colors.graphite },
  strikeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xxs },
  strikeCount: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.footnote, color: colors.danger },
  clearBtn: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
});
