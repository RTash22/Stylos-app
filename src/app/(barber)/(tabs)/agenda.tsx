/**
 * Barber Agenda Screen — Uses ResponsiveSchedule.
 */
import React, { useState, useCallback } from 'react';
import { View, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers';
import { useAppointments, useWorkingHours, useTimeBlocks } from '@/hooks';
import { ResponsiveSchedule, DateCarousel } from '@/components/calendar';
import { LoadingSkeleton, ErrorState } from '@/components/ui';
import { colors, spacing } from '@/theme';
import { startOfDay, endOfDay, getWeekStart, getWeekEnd, getDayIndex } from '@/utils/dates';
import { useResponsive } from '@/hooks';
import type { Appointment, DayOfWeek } from '@/types';

export default function BarberAgendaScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { isTabletLandscape } = useResponsive();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStart = isTabletLandscape ? getWeekStart(selectedDate) : startOfDay(selectedDate);
  const dateEnd = isTabletLandscape ? getWeekEnd(selectedDate) : endOfDay(selectedDate);

  const { appointments, loading, error, refresh } = useAppointments({
    barberId: profile?.id ?? null,
    dateStart,
    dateEnd,
  });

  const { workingHours, loading: whLoading } = useWorkingHours(profile?.id ?? null);
  const dayWH = workingHours.find((wh) => wh.day_of_week === (getDayIndex(selectedDate) as DayOfWeek));

  const { timeBlocks } = useTimeBlocks({
    barberId: profile?.id ?? null,
    dateStart,
    dateEnd,
  });

  const handleAppointmentPress = useCallback(
    (apt: Appointment) => {
      router.push(`/(barber)/appointment/${apt.id}`);
    },
    [router],
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {!isTabletLandscape && (
        <DateCarousel selectedDate={selectedDate} onDateChange={setSelectedDate} />
      )}

      {loading && !appointments.length ? (
        <View style={styles.skeletons}>
          <LoadingSkeleton height={80} />
          <LoadingSkeleton height={60} />
          <LoadingSkeleton height={100} />
          <LoadingSkeleton height={40} />
        </View>
      ) : (
        <ResponsiveSchedule
          selectedDate={selectedDate}
          appointments={appointments}
          workingHours={dayWH}
          timeBlocks={timeBlocks}
          onAppointmentPress={handleAppointmentPress}
          onDayPress={setSelectedDate}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  skeletons: { padding: spacing.xl, gap: spacing.md },
});
