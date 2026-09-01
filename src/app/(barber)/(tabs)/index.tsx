/**
 * Barber Home Screen
 */
import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, RefreshControl, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/providers';
import { useAppointments, useWorkingHours } from '@/hooks';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { APP_NAME, MIN_TOUCH_TARGET, DEFAULT_WORK_START_HOUR, DEFAULT_WORK_END_HOUR } from '@/constants';
import { nowLocal, formatFullDate, formatTime, toLocalDate, getDayIndex, startOfDay, endOfDay } from '@/utils/dates';
import { DateCarousel } from '@/components/calendar';
import { StatusBadge } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/ui';
import type { DayOfWeek } from '@/types';

export default function BarberHomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = nowLocal();

  const { appointments, loading, error, refresh } = useAppointments({
    barberId: profile?.id ?? null,
    dateStart: startOfDay(selectedDate),
    dateEnd: endOfDay(selectedDate),
  });

  const { workingHours } = useWorkingHours(profile?.id ?? null);
  const todayWH = workingHours.find((wh) => wh.day_of_week === (getDayIndex(today) as DayOfWeek));

  const todayCount = appointments.length;
  const confirmedToday = appointments.filter((a) => a.status === 'confirmada').length;
  const pendingToday = appointments.filter((a) => a.status === 'pendiente').length;

  const nextAppointment = useMemo(() => {
    const now = new Date();
    return appointments.find(
      (a) =>
        ['confirmada', 'pendiente'].includes(a.status) &&
        new Date(a.start_time) > now,
    );
  }, [appointments]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Peluquero';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.walnut} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
          <Text style={styles.dateText}>{formatFullDate(today)}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Date Carousel */}
      <DateCarousel selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, shadows.sm]}>
          <MaterialCommunityIcons name="calendar-check" size={24} color={colors.success} />
          <Text style={styles.statNumber}>{todayCount}</Text>
          <Text style={styles.statLabel}>Citas hoy</Text>
        </View>
        <View style={[styles.statCard, shadows.sm]}>
          <MaterialCommunityIcons name="clock-outline" size={24} color={colors.warning} />
          <Text style={styles.statNumber}>{pendingToday}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={[styles.statCard, shadows.sm]}>
          <MaterialCommunityIcons name="check-circle" size={24} color={colors.oliveGold} />
          <Text style={styles.statNumber}>{confirmedToday}</Text>
          <Text style={styles.statLabel}>Confirmadas</Text>
        </View>
      </View>

      {/* Next Appointment */}
      {nextAppointment && (
        <Pressable
          style={[styles.nextCard, shadows.md]}
          onPress={() => router.push(`/(barber)/appointment/${nextAppointment.id}`)}
        >
          <View style={styles.nextCardHeader}>
            <Text style={styles.nextCardTitle}>Próxima cita</Text>
            <StatusBadge status={nextAppointment.status} size="sm" />
          </View>
          <View style={styles.nextCardBody}>
            <MaterialCommunityIcons name="account" size={20} color={colors.walnut} />
            <Text style={styles.nextCardClient}>
              {nextAppointment.client?.full_name ?? 'Cliente'}
            </Text>
          </View>
          <View style={styles.nextCardBody}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.icon} />
            <Text style={styles.nextCardTime}>
              {formatTime(toLocalDate(nextAppointment.start_time))} – {formatTime(toLocalDate(nextAppointment.end_time))}
            </Text>
          </View>
          {nextAppointment.service && (
            <View style={styles.nextCardBody}>
              <MaterialCommunityIcons name="content-cut" size={20} color={colors.icon} />
              <Text style={styles.nextCardService}>{nextAppointment.service.name}</Text>
            </View>
          )}
        </Pressable>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, shadows.sm]}
          onPress={() => router.push('/(barber)/(tabs)/agenda')}
        >
          <MaterialCommunityIcons name="plus-circle" size={22} color={colors.surface} />
          <Text style={styles.actionBtnText}>Nueva cita</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtnSecondary, shadows.sm]}
          onPress={() => router.push('/(barber)/availability')}
        >
          <MaterialCommunityIcons name="calendar-lock" size={22} color={colors.walnut} />
          <Text style={styles.actionBtnSecondaryText}>Bloquear horario</Text>
        </Pressable>
      </View>

      {/* Loading / Error / Empty */}
      {loading && !appointments.length && (
        <View style={styles.skeletonSection}>
          <LoadingSkeleton height={60} />
          <LoadingSkeleton height={60} />
          <LoadingSkeleton height={60} />
        </View>
      )}
      {error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && todayCount === 0 && (
        <EmptyState
          icon="calendar-blank-outline"
          title="Sin citas hoy"
          message="Disfruta tu día o bloquea horarios para organizar tu semana."
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing['3xl'] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingTop: spacing['3xl'], paddingBottom: spacing.lg,
  },
  greeting: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1, color: colors.graphite,
  },
  dateText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body,
    color: colors.icon, marginTop: spacing.xxs,
  },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.walnut,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title3, color: colors.surface,
  },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: spacing.xl,
    gap: spacing.md, marginTop: spacing.lg,
  },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.base, alignItems: 'center', gap: spacing.xs,
  },
  statNumber: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title2, color: colors.graphite,
  },
  statLabel: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.caption, color: colors.icon,
  },
  nextCard: {
    backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg,
    marginHorizontal: spacing.xl, marginTop: spacing.xl,
  },
  nextCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md,
  },
  nextCardTitle: {
    fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.headline, color: colors.graphite,
  },
  nextCardBody: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs,
  },
  nextCardClient: {
    fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.body, color: colors.walnut,
  },
  nextCardTime: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body, color: colors.icon,
  },
  nextCardService: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body, color: colors.icon,
  },
  actionsRow: {
    flexDirection: 'row', paddingHorizontal: spacing.xl,
    gap: spacing.md, marginTop: spacing.xl,
  },
  actionBtn: {
    flex: 1, backgroundColor: colors.walnut, borderRadius: radii.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET + 4, gap: spacing.sm,
  },
  actionBtnText: {
    fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.callout, color: colors.surface,
  },
  actionBtnSecondary: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET + 4, gap: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  actionBtnSecondaryText: {
    fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.callout, color: colors.walnut,
  },
  skeletonSection: {
    paddingHorizontal: spacing.xl, marginTop: spacing.xl, gap: spacing.md,
  },
});
