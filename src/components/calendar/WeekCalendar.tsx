/**
 * WeekCalendar — Tablet-optimised weekly grid agenda.
 */
import React, { useMemo, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '@/theme';
import { PX_PER_MINUTE, DEFAULT_WORK_START_HOUR, DEFAULT_WORK_END_HOUR } from '@/constants';
import { generateHourLabels, getBlockPosition } from '@/utils/schedule';
import { addDays, formatDate, isSameDay, isToday } from '@/utils/dates';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { CurrentTimeIndicator } from '@/components/calendar/CurrentTimeIndicator';
import type { Appointment } from '@/types';

interface Props {
  weekStart: Date;
  appointments: Appointment[];
  onAppointmentPress: (appointment: Appointment) => void;
  onDayPress?: (date: Date) => void;
  startHour?: number;
  endHour?: number;
}

const HOUR_COL_WIDTH = 50;
const DAY_COL_MIN_WIDTH = 120;

export function WeekCalendar({
  weekStart,
  appointments,
  onAppointmentPress,
  onDayPress,
  startHour = DEFAULT_WORK_START_HOUR,
  endHour = DEFAULT_WORK_END_HOUR,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const hourLabels = useMemo(() => generateHourLabels(startHour, endHour), [startHour, endHour]);
  const totalHeight = (endHour - startHour) * 60 * PX_PER_MINUTE;

  // Mon–Sat (6 days)
  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const day of days) {
      const key = day.toISOString().split('T')[0];
      map.set(key, appointments.filter((a) => isSameDay(new Date(a.starts_at), day)));
    }
    return map;
  }, [days, appointments]);

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.hourHeaderSpacer} />
        {days.map((day) => {
          const today = isToday(day);
          return (
            <Pressable
              key={day.toISOString()}
              style={[styles.dayHeader, today && styles.dayHeaderToday]}
              onPress={() => onDayPress?.(day)}
            >
              <Text style={[styles.dayHeaderName, today && styles.dayHeaderNameToday]}>
                {formatDate(day, 'EEE').toUpperCase()}
              </Text>
              <Text style={[styles.dayHeaderNum, today && styles.dayHeaderNumToday]}>
                {formatDate(day, 'd')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Grid body */}
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <View style={[styles.gridBody, { height: totalHeight }]}>
          {/* Hour labels */}
          <View style={styles.hourCol}>
            {hourLabels.map((label, i) => (
              <View key={label} style={[styles.hourLabel, { top: i * 60 * PX_PER_MINUTE - 8 }]}>
                <Text style={styles.hourText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Day columns */}
          {days.map((day) => {
            const key = day.toISOString().split('T')[0];
            const dayApts = appointmentsByDay.get(key) ?? [];
            const today = isToday(day);

            return (
              <View key={key} style={styles.dayColumn}>
                {/* Grid lines */}
                {hourLabels.map((label, i) => (
                  <View
                    key={`gl-${label}`}
                    style={[styles.gridLine, { top: i * 60 * PX_PER_MINUTE }]}
                  />
                ))}

                {/* Appointments */}
                {dayApts.map((apt) => {
                  const pos = getBlockPosition(apt.starts_at, apt.ends_at, startHour);
                  return (
                    <View key={apt.id} style={[styles.aptWrap, { top: pos.topPx, height: pos.heightPx }]}>
                      <AppointmentCard
                        appointment={apt}
                        heightPx={pos.heightPx}
                        onPress={onAppointmentPress}
                      />
                    </View>
                  );
                })}

                {today && <CurrentTimeIndicator dayStartHour={startHour} />}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hourHeaderSpacer: { width: HOUR_COL_WIDTH },
  dayHeader: {
    flex: 1,
    minWidth: DAY_COL_MIN_WIDTH,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dayHeaderToday: { backgroundColor: colors.paleSage + '60' },
  dayHeaderName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.caption,
    color: colors.icon,
  },
  dayHeaderNameToday: { color: colors.walnut },
  dayHeaderNum: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.headline,
    color: colors.graphite,
  },
  dayHeaderNumToday: { color: colors.walnut },
  gridBody: { flexDirection: 'row' },
  hourCol: { width: HOUR_COL_WIDTH, position: 'relative' },
  hourLabel: { position: 'absolute', left: 0, width: HOUR_COL_WIDTH, paddingRight: spacing.xs, alignItems: 'flex-end' },
  hourText: { fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.caption, color: colors.placeholder },
  dayColumn: {
    flex: 1,
    minWidth: DAY_COL_MIN_WIDTH,
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.border, opacity: 0.4 },
  aptWrap: { position: 'absolute', left: 0, right: 0 },
});
