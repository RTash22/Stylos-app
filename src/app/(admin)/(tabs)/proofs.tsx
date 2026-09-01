/**
 * Admin — Proof Review Queue
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, Pressable, RefreshControl, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { EmptyState, LoadingSkeleton } from '@/components/ui';
import { DepositCard } from '@/components/deposits';
import type { Deposit, DepositStatus, Client } from '@/types';

type FilterOption = 'pending' | 'all' | 'verified' | 'rejected';

const FILTER_LABELS: Record<FilterOption, string> = {
  pending: 'Pendientes',
  all: 'Todos',
  verified: 'Aprobados',
  rejected: 'Rechazados',
};

const FILTER_STATUS: Record<FilterOption, DepositStatus | null> = {
  pending: 'comprobante_recibido',
  all: null,
  verified: 'verificado',
  rejected: 'rechazado',
};

export default function AdminProofsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterOption>('pending');
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const statusFilter = FILTER_STATUS[filter];
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    const depositList = (data as Deposit[]) ?? [];
    setDeposits(depositList);

    // Fetch client names for all deposits
    const clientIds = [...new Set(depositList.map((d) => d.client_id).filter(Boolean))];
    if (clientIds.length > 0) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .in('id', clientIds);

      if (clientData) {
        const map: Record<string, Client> = {};
        (clientData as Client[]).forEach((c) => { map[c.id] = c; });
        setClients(map);
      }
    }

    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  const pendingCount = useMemo(() =>
    deposits.filter((d) => d.status === 'pendiente' /* as comprobante_recibido doesn't exist */).length,
  [deposits]);

  const renderItem = ({ item }: { item: Deposit }) => (
    <DepositCard
      deposit={item}
      clientName={clients[item.client_id]?.full_name}
      onPress={() => router.push(`/(admin)/proof/${item.id}`)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Comprobantes</Text>
        {filter === 'pending' && pendingCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount}</Text>
          </View>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(Object.keys(FILTER_LABELS) as FilterOption[]).map((key) => (
          <Pressable
            key={key}
            style={[styles.filterBtn, filter === key && styles.filterBtnActive]}
            onPress={() => setFilter(key)}
          >
            <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>
              {FILTER_LABELS[key]}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} height={120} />)}
        </View>
      ) : (
        <FlatList
          data={deposits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.walnut} />}
          ListEmptyComponent={
            <EmptyState
              icon="file-document-outline"
              title={filter === 'pending' ? 'Sin comprobantes pendientes' : 'Sin comprobantes'}
              message={filter === 'pending'
                ? 'Todos los comprobantes han sido revisados.'
                : 'No hay comprobantes con este filtro.'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1, color: colors.graphite,
  },
  badge: {
    backgroundColor: colors.warning, borderRadius: radii.full,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs,
    minWidth: 24, alignItems: 'center',
  },
  badgeText: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.caption, color: colors.surface,
  },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: spacing.xl,
    gap: spacing.sm, marginBottom: spacing.md,
  },
  filterBtn: {
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
    borderRadius: radii.full, backgroundColor: colors.surfaceMuted,
  },
  filterBtnActive: {
    backgroundColor: colors.walnut,
  },
  filterText: {
    fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.subheadline, color: colors.icon,
  },
  filterTextActive: {
    color: colors.surface,
  },
  listContent: { padding: spacing.xl, paddingBottom: spacing['3xl'] },
  skeletonList: { padding: spacing.xl, gap: spacing.md },
});
