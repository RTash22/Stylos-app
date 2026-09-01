/**
 * Admin Dashboard
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { APP_NAME } from '@/constants';
import { nowLocal, formatFullDate, startOfDay, endOfDay } from '@/utils/dates';
import { LoadingSkeleton } from '@/components/ui';

interface DashStats {
  todayTotal: number;
  todayPending: number;
  todayCompleted: number;
  todayNoShow: number;
  activeBarbers: number;
  pendingProofs: number;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const today = nowLocal();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const dayStart = startOfDay(today).toISOString();
    const dayEnd = endOfDay(today).toISOString();

    const [aptsRes, barbersRes, proofsRes] = await Promise.all([
      supabase.from('appointments').select('status', { count: 'exact' }).gte('starts_at', dayStart).lte('starts_at', dayEnd),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'peluquero').eq('is_active', true),
      supabase.from('deposits').select('id', { count: 'exact' }).eq('status', 'comprobante_recibido'),
    ]);

    const apts = (aptsRes.data ?? []) as { status: string }[];
    setStats({
      todayTotal: apts.length,
      todayPending: apts.filter((a) => a.status === 'pendiente').length,
      todayCompleted: apts.filter((a) => a.status === 'completada').length,
      todayNoShow: apts.filter((a) => a.status === 'no_asistio').length,
      activeBarbers: barbersRes.count ?? 0,
      pendingProofs: proofsRes.count ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => { setRefreshing(true); await fetchStats(); setRefreshing(false); }, [fetchStats]);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Admin';

  const statItems = stats ? [
    { label: 'Citas hoy', value: stats.todayTotal, icon: 'calendar-today' as const, color: colors.walnut },
    { label: 'Pendientes', value: stats.todayPending, icon: 'clock-outline' as const, color: colors.warning },
    { label: 'Completadas', value: stats.todayCompleted, icon: 'check-circle' as const, color: colors.success },
    { label: 'No asistencias', value: stats.todayNoShow, icon: 'account-off' as const, color: colors.danger },
    { label: 'Peluqueros activos', value: stats.activeBarbers, icon: 'account-group' as const, color: colors.oliveGold },
    { label: 'Comprobantes pendientes', value: stats.pendingProofs, icon: 'file-document-outline' as const, color: colors.warning },
  ] : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.walnut} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {firstName} 🏠</Text>
            <Text style={styles.dateText}>{formatFullDate(today)}</Text>
          </View>
          <Pressable style={styles.avatarCircle} onPress={signOut}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.statsGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => <LoadingSkeleton key={i} height={90} />)}
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {statItems.map((item) => (
              <View key={item.label} style={[styles.statCard, shadows.sm]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                <Text style={styles.statNumber}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing['3xl'] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl,
  },
  greeting: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1, color: colors.graphite },
  dateText: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body, color: colors.icon, marginTop: spacing.xxs },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.oliveGold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title3, color: colors.surface },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md,
  },
  statCard: {
    width: '47%', backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.base, alignItems: 'center', gap: spacing.xs,
  },
  statNumber: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1, color: colors.graphite },
  statLabel: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.caption, color: colors.icon, textAlign: 'center' },
});
