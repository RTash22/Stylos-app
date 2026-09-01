/**
 * DayTimeline — Phone-optimised single-day vertical agenda.
 */
import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '@/theme';
import { DEFAULT_WORK_START_HOUR, DEFAULT_WORK_END_HOUR, PX_PER_MINUTE } from '@/constants';
import { generateHourLabels, buildDayBlocks } from '@/utils/schedule';
import { isToday, getMinutesFromMidnight, nowLocal } from '@/utils/dates';
import { CurrentTimeIndicator } from '@/components/calendar/CurrentTimeIndicator';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import type { Appointment, WorkingHours, TimeBlock } from '@/types';

interface Props {
  date: Date;
  workingHours: WorkingHours | undefined;
  appointments: Appointment[];
  timeBlocks: TimeBlock[];
  onAppointmentPress: (appointment: Appointment) => void;
  onAvailablePress?: (startMinutes: number) => void;
}

const HOUR_LABEL_WIDTH = 52;

export function DayTimeline({
  date, workingHours, appointments, timeBlocks, onAppointmentPress, onAvailablePress,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const startHour = workingHours
    ? parseInt(workingHours.start_local_time.split(':')[0])
    : DEFAULT_WORK_START_HOUR;
  const endHour = workingHours
    ? parseInt(workingHours.end_local_time.split(':')[0])
    : DEFAULT_WORK_END_HOUR;

  const hourLabels = useMemo(() => generateHourLabels(startHour, endHour), [startHour, endHour]);
  const totalHeight = (endHour - startHour) * 60 * PX_PER_MINUTE;
  const blocks = useMemo(
    () => buildDayBlocks(date, workingHours, appointments, timeBlocks, startHour, endHour),
    [date, workingHours, appointments, timeBlocks, startHour, endHour],
  );

  useEffect(() => {
    if (isToday(date) && scrollRef.current) {
      const off = Math.max(0, (getMinutesFromMidnight(nowLocal()) - startHour * 60 - 60) * PX_PER_MINUTE);
      setTimeout(() => scrollRef.current?.scrollTo({ y: off, animated: true }), 300);
    }
  }, [date, startHour]);

  return (
    <ScrollView ref={scrollRef} style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.grid, { height: totalHeight }]}>
        <View style={styles.hoursColumn}>
          {hourLabels.map((l, i) => (
            <View key={l} style={[styles.hourLabel, { top: i * 60 * PX_PER_MINUTE - 8 }]}>
              <Text style={styles.hourText}>{l}</Text>
            </View>
          ))}
        </View>
        <View style={styles.gridLines}>
          {hourLabels.map((l, i) => (
            <View key={`gl-${l}`} style={[styles.gridLine, { top: i * 60 * PX_PER_MINUTE }]} />
          ))}
        </View>
        <View style={styles.blocksColumn}>
          {blocks.map((b) => {
            if (b.type === 'appointment' && b.appointment) {
              return (
                <View key={b.id} style={[styles.abs, { top: b.topPx, height: b.heightPx }]}>
                  <AppointmentCard appointment={b.appointment} heightPx={b.heightPx} onPress={onAppointmentPress} />
                </View>
              );
            }
            if (b.type === 'available') {
              return (
                <Pressable key={b.id} style={[styles.abs, styles.avail, { top: b.topPx, height: Math.max(b.heightPx, 44) }]}
                  onPress={() => onAvailablePress?.(b.startMinutes)}>
                  <MaterialCommunityIcons name="plus" size={16} color={colors.oliveGold} />
                  <Text style={styles.availText}>Disponible</Text>
                </Pressable>
              );
            }
            if (b.type === 'break') {
              return (
                <View key={b.id} style={[styles.abs, styles.breakB, { top: b.topPx, height: b.heightPx }]}>
                  <MaterialCommunityIcons name="coffee-outline" size={14} color={colors.icon} />
                  <Text style={styles.breakText}>{b.label}</Text>
                </View>
              );
            }
            if (b.type === 'blocked') {
              return (
                <View key={b.id} style={[styles.abs, styles.blocked, { top: b.topPx, height: b.heightPx }]}>
                  <MaterialCommunityIcons name="lock-outline" size={14} color={colors.disabled} />
                  <Text style={styles.blockedText}>{b.label}</Text>
                </View>
              );
            }
            return null;
          })}
          {isToday(date) && <CurrentTimeIndicator dayStartHour={startHour} />}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  grid: { flexDirection: 'row', position: 'relative' },
  hoursColumn: { width: HOUR_LABEL_WIDTH, position: 'relative' },
  hourLabel: { position: 'absolute', left: 0, width: HOUR_LABEL_WIDTH, paddingRight: spacing.sm, alignItems: 'flex-end' as const },
  hourText: { fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.caption, color: colors.placeholder },
  gridLines: { position: 'absolute', left: HOUR_LABEL_WIDTH, right: 0, top: 0, bottom: 0 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.border, opacity: 0.5 },
  blocksColumn: { flex: 1, position: 'relative', marginLeft: spacing.xs },
  abs: { position: 'absolute', left: 0, right: 0 },
  avail: {
    borderRadius: radii.sm, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.oliveGold,
    backgroundColor: colors.paleSage + '40', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.xs, marginHorizontal: spacing.xs,
  },
  availText: { fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.caption, color: colors.oliveGold },
  breakB: {
    borderRadius: radii.sm, backgroundColor: colors.surfaceMuted, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginHorizontal: spacing.xs,
  },
  breakText: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.caption, color: colors.icon },
  blocked: {
    borderRadius: radii.sm, backgroundColor: colors.surfaceMuted, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginHorizontal: spacing.xs, opacity: 0.7,
  },
  blockedText: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.caption, color: colors.disabled },
});
