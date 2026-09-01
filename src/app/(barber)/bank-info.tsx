/**
 * Bank Info Screen — Shows bank details for deposit.
 *
 * Barbers use this to show clients where to deposit.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Share, ActivityIndicator, Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { EmptyState } from '@/components/ui';
import type { BankSettings } from '@/types';

export default function BankInfoScreen() {
  const [settings, setSettings] = useState<BankSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bank_settings')
      .select('*')
      .limit(1)
      .single();

    if (data) setSettings(data as BankSettings);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copiado', `${label} copiado al portapapeles.`);
  }, []);

  const shareInfo = useCallback(async () => {
    if (!settings) return;

    const message = [
      `💈 Datos para depósito - El Stylo Salón`,
      ``,
      `Banco: ${settings.bank_name}`,
      `Beneficiario: ${settings.beneficiary}`,
      `CLABE: ${settings.clabe}`,
      `Monto: $${settings.default_amount.toFixed(2)} MXN`,
      ``,
      `⏱ Tiempo para depositar: ${settings.payment_minutes} minutos`,
      ``,
      `Envía tu comprobante por WhatsApp.`,
    ].join('\n');

    try {
      await Share.share({ message });
    } catch (_err) { /* user cancelled */ }
  }, [settings]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{
        headerShown: true,
        title: 'Datos bancarios',
        headerTintColor: colors.walnut,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.sizes.headline,
          color: colors.graphite,
        },
      }} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.walnut} />
        </View>
      ) : !settings || !settings.deposits_enabled ? (
        <EmptyState
          icon="bank-off"
          title="Depósitos no activos"
          message="El administrador no ha configurado los datos bancarios."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.bankCard, shadows.lg]}>
            <View style={styles.bankHeader}>
              <MaterialCommunityIcons name="bank" size={28} color={colors.walnut} />
              <Text style={styles.bankName}>{settings.bank_name}</Text>
            </View>

            <View style={styles.divider} />

            {/* Beneficiary */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldLabel}>Beneficiario</Text>
                <Text style={styles.fieldValue}>{settings.beneficiary}</Text>
              </View>
              <Pressable
                style={styles.copyBtn}
                onPress={() => copyToClipboard(settings.beneficiary, 'Beneficiario')}
                hitSlop={8}
              >
                <MaterialCommunityIcons name="content-copy" size={18} color={colors.walnut} />
              </Pressable>
            </View>

            {/* CLABE */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldLabel}>CLABE interbancaria</Text>
                <Text style={[styles.fieldValue, styles.monoValue]}>{settings.clabe}</Text>
              </View>
              <Pressable
                style={styles.copyBtn}
                onPress={() => copyToClipboard(settings.clabe, 'CLABE')}
                hitSlop={8}
              >
                <MaterialCommunityIcons name="content-copy" size={18} color={colors.walnut} />
              </Pressable>
            </View>

            <View style={styles.divider} />

            {/* Amount */}
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Monto del anticipo</Text>
              <Text style={styles.amountValue}>
                ${settings.default_amount.toFixed(2)} MXN
              </Text>
            </View>

            {/* Timer */}
            <View style={styles.timerRow}>
              <MaterialCommunityIcons name="timer-sand" size={16} color={colors.warning} />
              <Text style={styles.timerText}>
                {settings.payment_minutes} min para depositar
              </Text>
            </View>
          </View>

          {/* Share button */}
          <Pressable
            style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}
            onPress={shareInfo}
          >
            <MaterialCommunityIcons name="share-variant" size={20} color={colors.surface} />
            <Text style={styles.shareBtnText}>Compartir datos con cliente</Text>
          </Pressable>

          <Text style={styles.footerNote}>
            Estos datos son configurados por el administrador desde la app.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing['3xl'] },
  bankCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  bankName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.title2,
    color: colors.graphite,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  fieldInfo: { flex: 1 },
  fieldLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.caption,
    color: colors.icon,
    marginBottom: 2,
  },
  fieldValue: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.body,
    color: colors.graphite,
  },
  monoValue: {
    fontFamily: typography.fontFamily.regular,
    letterSpacing: 1.5,
    fontSize: typography.sizes.callout,
  },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  amountLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.body,
    color: colors.icon,
  },
  amountValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.title2,
    color: colors.success,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFF4E6',
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  timerText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.subheadline,
    color: colors.warning,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.walnut,
    borderRadius: radii.lg,
    paddingVertical: spacing.base,
    marginBottom: spacing.xl,
  },
  shareBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.callout,
    color: colors.surface,
  },
  footerNote: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.caption,
    color: colors.placeholder,
    textAlign: 'center',
  },
});
