/**
 * ErrorState — Error display with retry button.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
      </View>
      <Text style={styles.title}>Algo salió mal</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          style={({ pressed }) => [styles.retryBtn, pressed && styles.retryPressed]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Reintentar"
        >
          <MaterialCommunityIcons name="refresh" size={18} color={colors.surface} />
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    backgroundColor: '#FCEAE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.headline,
    color: colors.graphite,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.placeholder,
    textAlign: 'center',
    lineHeight: typography.lineHeights.body,
    marginBottom: spacing.xl,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.walnut,
    paddingHorizontal: spacing.xl,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  retryPressed: {
    opacity: 0.85,
  },
  retryText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.callout,
    color: colors.surface,
  },
});
