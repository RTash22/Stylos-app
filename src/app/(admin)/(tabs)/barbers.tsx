/**
 * Admin — Barbers Management
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';
import { LoadingSkeleton, EmptyState } from '@/components/ui';
import type { Profile } from '@/types';

export default function AdminBarbersScreen() {
  const router = useRouter();
  const [barbers, setBarbers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'barber').order('full_name');
    setBarbers((data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => { setRefreshing(true); await fetch(); setRefreshing(false); }, [fetch]);

  const renderBarber = ({ item }: { item: Profile }) => (
    <Pressable style={[styles.card, shadows.sm]} onPress={() => router.push(`/(admin)/barber/${item.id}`)}>
      <View style={[styles.avatar, { backgroundColor: item.is_active ? colors.paleSage : colors.surfaceMuted }]}>
        <Text style={styles.avatarText}>{item.full_name[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={[styles.status, { color: item.is_active ? colors.success : colors.danger }]}>
          {item.is_active ? 'Activo' : 'Inactivo'}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.disabled} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Peluqueros</Text>
      </View>

      {loading ? (
        <View style={styles.pad}>
          {[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={64} />)}
        </View>
      ) : (
        <FlatList
          data={barbers}
          keyExtractor={(item) => item.id}
          renderItem={renderBarber}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.walnut} />}
          ListEmptyComponent={<EmptyState icon="account-off-outline" title="Sin peluqueros" message="No hay peluqueros registrados." />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1, color: colors.graphite },
  pad: { paddingHorizontal: spacing.xl, gap: spacing.md },
  list: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing['3xl'] },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radii.lg, padding: spacing.md, gap: spacing.md,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.callout, color: colors.walnut },
  info: { flex: 1 },
  name: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.body, color: colors.graphite },
  status: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.footnote },
});
