/**
 * ConfirmActionDialog — Modal dialog for destructive/important actions.
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Optional custom content rendered between message and action buttons */
  children?: React.ReactNode;
}

export function ConfirmActionDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}: Props) {
  const handleConfirm = () => {
    Haptics.notificationAsync(
      isDestructive
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success,
    );
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, shadows.lg]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {children}

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.cancelBtn, pressed && styles.btnPressed]}
              onPress={onCancel}
              disabled={loading}
              accessibilityRole="button"
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                isDestructive ? styles.dangerBtn : styles.confirmBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={handleConfirm}
              disabled={loading}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.title3,
    color: colors.graphite,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.icon,
    lineHeight: typography.lineHeights.body,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btn: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.85,
  },
  cancelBtn: {
    backgroundColor: colors.surfaceMuted,
  },
  confirmBtn: {
    backgroundColor: colors.walnut,
  },
  dangerBtn: {
    backgroundColor: colors.danger,
  },
  cancelText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.callout,
    color: colors.graphite,
  },
  confirmText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.callout,
    color: colors.surface,
  },
});
