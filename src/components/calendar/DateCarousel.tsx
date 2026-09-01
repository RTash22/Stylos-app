/**
 * DateCarousel — Horizontal scrollable date selector.
 */
import React, { useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { addDays, isToday, isSameDay, formatDate } from '@/utils/dates';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  daysToShow?: number;
}

export function DateCarousel({ selectedDate, onDateChange, daysToShow = 14 }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: daysToShow }, (_, i) => addDays(today, i - 2));
  }, [daysToShow]);

  const renderDate = useCallback(
    (date: Date) => {
      const selected = isSameDay(date, selectedDate);
      const today = isToday(date);

      return (
        <Pressable
          key={date.toISOString()}
          style={[
            styles.dateItem,
            selected && styles.dateItemSelected,
            today && !selected && styles.dateItemToday,
          ]}
          onPress={() => onDateChange(date)}
          accessibilityRole="button"
          accessibilityLabel={formatDate(date, 'EEEE d MMMM')}
          accessibilityState={{ selected }}
        >
          <Text
            style={[
              styles.dayName,
              selected && styles.dayNameSelected,
            ]}
          >
            {formatDate(date, 'EEE').toUpperCase()}
          </Text>
          <Text
            style={[
              styles.dayNumber,
              selected && styles.dayNumberSelected,
            ]}
          >
            {formatDate(date, 'd')}
          </Text>
          {today && <View style={[styles.todayDot, selected && styles.todayDotSelected]} />}
        </Pressable>
      );
    },
    [selectedDate, onDateChange],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map(renderDate)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  dateItem: {
    width: 52,
    minHeight: MIN_TOUCH_TARGET + 20,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  dateItemSelected: {
    backgroundColor: colors.walnut,
  },
  dateItemToday: {
    borderWidth: 1.5,
    borderColor: colors.oliveGold,
  },
  dayName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.caption,
    color: colors.icon,
    marginBottom: spacing.xxs,
  },
  dayNameSelected: {
    color: colors.paleSage,
  },
  dayNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.title3,
    color: colors.graphite,
  },
  dayNumberSelected: {
    color: colors.surface,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.oliveGold,
    marginTop: spacing.xxs,
  },
  todayDotSelected: {
    backgroundColor: colors.paleSage,
  },
});
