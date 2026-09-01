/**
 * AppointmentCard — Compact card displayed in the schedule grid.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radii, appointmentStateColors } from '@/theme';
import { STATUS_LABELS } from '@/utils/stateMachine';
import { formatTime, toLocalDate } from '@/utils/dates';
import type { Appointment } from '@/types';
import { MIN_TOUCH_TARGET } from '@/constants';

interface Props {
  appointment: Appointment;
  heightPx: number;
  onPress: (appointment: Appointment) => void;
}

export function AppointmentCard({ appointment, heightPx, onPress }: Props) {
  const stateColor = appointmentStateColors[appointment.status] ?? appointmentStateColors.pendiente;
  const startTime = formatTime(toLocalDate(appointment.starts_at));
  const endTime = formatTime(toLocalDate(appointment.ends_at));
  const isCompact = heightPx < 60;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          height: Math.max(heightPx, MIN_TOUCH_TARGET),
          backgroundColor: stateColor.bg,
          borderLeftColor: stateColor.text,
        },
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(appointment)}
      accessibilityRole="button"
      accessibilityLabel={`Cita con ${appointment.client?.full_name ?? 'Cliente'} a las ${startTime}`}
    >
      <View style={styles.content}>
        {isCompact ? (
          <Text style={[styles.clientName, { color: stateColor.text }]} numberOfLines={1}>
            {startTime} · {appointment.client?.full_name ?? 'Cliente'}
          </Text>
        ) : (
          <>
            <View style={styles.topRow}>
              <Text style={[styles.clientName, { color: stateColor.text }]} numberOfLines={1}>
                {appointment.client?.full_name ?? 'Cliente'}
              </Text>
              <View style={[styles.statusDot, { backgroundColor: stateColor.text }]} />
            </View>
            <Text style={[styles.timeText, { color: stateColor.text }]}>
              {startTime} – {endTime}
            </Text>
            {appointment.service && (
              <Text style={[styles.serviceText, { color: stateColor.text }]} numberOfLines={1}>
                <MaterialCommunityIcons name="content-cut" size={11} color={stateColor.text} />{' '}
                {appointment.service.name}
              </Text>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 3,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  clientName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.subheadline,
    flex: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  timeText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.caption,
    opacity: 0.8,
  },
  serviceText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.caption,
    marginTop: spacing.xxs,
    opacity: 0.7,
  },
});
