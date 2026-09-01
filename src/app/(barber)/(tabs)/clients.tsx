/**
 * Barber Clients Screen
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, RefreshControl, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET, STRIKE_THRESHOLD } from '@/constants';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/ui';
import { useDebounce } from '@/hooks';
import type { Client } from '@/types';

export default function BarberClientsScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('clients').select('*').order('full_name');
      if (debouncedSearch) {
        query = query.ilike('full_name', `%${debouncedSearch}%`);
      }
      const { data, error: fetchError } = await query.limit(50);
      if (fetchError) { setError(fetchError.message); }
      else { setClients((data as Client[]) ?? []); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally { setLoading(false); }
  }, [debouncedSearch]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  }, [fetchClients]);

  const renderClient = ({ item }: { item: Client }) => (
    <Pressable
      style={[styles.clientCard, shadows.sm]}
      onPress={() => router.push(`/(barber)/client/${item.id}`)}
    >
      <View style={styles.clientAvatar}>
        <Text style={styles.clientAvatarText}>{item.full_name[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.full_name}</Text>
        <Text style={styles.clientPhone}>
          {item.phone ? `${item.phone.slice(0, 4)}••••${item.phone.slice(-2)}` : 'Sin teléfono'}
        </Text>
      </View>
      {item.strikes >= STRIKE_THRESHOLD && (
        <View style={styles.strikeBadge}>
          <MaterialCommunityIcons name="alert" size={14} color={colors.danger} />
          <Text style={styles.strikeText}>{item.strikes}</Text>
        </View>
      )}
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.disabled} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
      </View>

      <View style={styles.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.placeholder} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre..."
          placeholderTextColor={colors.placeholder}
        />
      </View>

      {error && <ErrorState message={error} onRetry={fetchClients} />}

      {loading && !clients.length ? (
        <View style={styles.skeletons}>
          {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} height={64} />)}
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          renderItem={renderClient}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.walnut} />}
          ListEmptyComponent={
            <EmptyState icon="account-search-outline" title="Sin resultados" message="No se encontraron clientes con ese nombre." />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1, color: colors.graphite },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    marginHorizontal: spacing.xl, borderRadius: radii.lg, paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1, minHeight: MIN_TOUCH_TARGET, marginLeft: spacing.sm,
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body, color: colors.graphite,
  },
  list: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing['3xl'] },
  clientCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radii.lg, padding: spacing.md, gap: spacing.md,
  },
  clientAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.paleSage,
    alignItems: 'center', justifyContent: 'center',
  },
  clientAvatarText: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.callout, color: colors.walnut },
  clientInfo: { flex: 1 },
  clientName: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.body, color: colors.graphite },
  clientPhone: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.footnote, color: colors.icon },
  strikeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xxs,
    backgroundColor: '#FCEAE8', borderRadius: radii.full, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs,
  },
  strikeText: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.footnote, color: colors.danger },
  skeletons: { paddingHorizontal: spacing.xl, gap: spacing.md },
});
