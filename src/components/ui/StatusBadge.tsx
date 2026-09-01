/**
 * StatusBadge — Colored badge showing appointment status.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { appointmentStateColors, typography, radii, spacing } from '@/theme';
import { STATUS_LABELS } from '@/utils/stateMachine';
import type { AppointmentStatus } from '@/types';

interface Props {
  status: AppointmentStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const stateColor = appointmentStateColors[status] ?? appointmentStateColors.pendiente;
  const label = STATUS_LABELS[status] ?? status;
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: stateColor.bg,
          borderColor: stateColor.border,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          paddingVertical: isSmall ? spacing.xxs : spacing.xs,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: stateColor.text,
            fontSize: isSmall ? typography.sizes.caption : typography.sizes.footnote,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
  },
});
