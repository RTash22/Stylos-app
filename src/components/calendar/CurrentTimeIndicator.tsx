/**
 * CurrentTimeIndicator — Red horizontal line showing current time.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PX_PER_MINUTE } from '@/constants';
import { getMinutesFromMidnight, nowLocal } from '@/utils/dates';
import { colors, typography, spacing } from '@/theme';

interface Props {
  dayStartHour: number;
}

export function CurrentTimeIndicator({ dayStartHour }: Props) {
  const [minutes, setMinutes] = useState(getMinutesFromMidnight(nowLocal()));

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes(getMinutesFromMidnight(nowLocal()));
    }, 60_000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const dayStartMinutes = dayStartHour * 60;
  const topPx = (minutes - dayStartMinutes) * PX_PER_MINUTE;

  if (topPx < 0) return null;

  const now = nowLocal();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <View style={[styles.container, { top: topPx }]} pointerEvents="none">
      <View style={styles.dot} />
      <View style={styles.line} />
      <Text style={styles.timeLabel}>{timeStr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    marginLeft: -5,
  },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.danger,
  },
  timeLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.caption,
    color: colors.danger,
    marginLeft: spacing.xs,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
  },
});
