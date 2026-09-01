/**
 * DepositCard — Compact card showing deposit status and proof info.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import type { Deposit, DepositStatus } from '@/types';

interface Props {
  deposit: Deposit;
  clientName?: string;
  onPress?: () => void;
}

const DEPOSIT_STATUS_CONFIG: Record<DepositStatus, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  pendiente: {
    label: 'Pendiente',
    icon: 'clock-outline',
    color: '#B88444',
    bgColor: '#FFF4E6',
  },
  comprobante_recibido: {
    label: 'Comprobante recibido',
    icon: 'file-document-check',
    color: '#7B6BA8',
    bgColor: '#EDE9FA',
  },
  verificado: {
    label: 'Verificado',
    icon: 'check-circle',
    color: '#667A4C',
    bgColor: '#EFF5E8',
  },
  rechazado: {
    label: 'Rechazado',
    icon: 'close-circle',
    color: '#A3453D',
    bgColor: '#FCEAE8',
  },
  expirado: {
    label: 'Expirado',
    icon: 'timer-sand-complete',
    color: '#9E9B96',
    bgColor: '#F3F1EE',
  },
};

export function DepositCard({ deposit, clientName, onPress }: Props) {
  const config = DEPOSIT_STATUS_CONFIG[deposit.status];
  const amount = deposit.amount?.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }) ?? '$0.00';

  const expiresAt = deposit.expires_at
    ? new Date(deposit.expires_at).toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <Pressable
      style={[styles.card, shadows.sm]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
          <MaterialCommunityIcons
            name={config.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={14}
            color={config.color}
          />
          <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
        </View>
        <Text style={styles.amount}>{amount}</Text>
      </View>

      {clientName && (
        <View style={styles.row}>
          <MaterialCommunityIcons name="account" size={16} color={colors.icon} />
          <Text style={styles.clientName}>{clientName}</Text>
        </View>
      )}

      <View style={styles.row}>
        <MaterialCommunityIcons name="pound" size={16} color={colors.icon} />
        <Text style={styles.reference}>Ref: {deposit.reference || 'Sin referencia'}</Text>
      </View>

      {deposit.proof_path && (
        <View style={styles.row}>
          <MaterialCommunityIcons name="image" size={16} color={colors.oliveGold} />
          <Text style={[styles.proofText, { color: colors.oliveGold }]}>Comprobante adjunto</Text>
        </View>
      )}

      {expiresAt && deposit.status === 'pendiente' && (
        <View style={styles.row}>
          <MaterialCommunityIcons name="timer-sand" size={16} color={colors.warning} />
          <Text style={[styles.expiry, { color: colors.warning }]}>Expira: {expiresAt}</Text>
        </View>
      )}

      {deposit.rejection_reason && (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Motivo de rechazo:</Text>
          <Text style={styles.reasonText}>{deposit.rejection_reason}</Text>
        </View>
      )}

      {onPress && (
        <View style={styles.arrowRow}>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.icon} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  badgeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.caption,
  },
  amount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.headline,
    color: colors.graphite,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  clientName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.body,
    color: colors.graphite,
  },
  reference: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.subheadline,
    color: colors.icon,
  },
  proofText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.subheadline,
  },
  expiry: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.caption,
  },
  reasonBox: {
    backgroundColor: '#FCEAE8',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  reasonLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.caption,
    color: colors.danger,
    marginBottom: spacing.xxs,
  },
  reasonText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.subheadline,
    color: colors.danger,
  },
  arrowRow: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
});
