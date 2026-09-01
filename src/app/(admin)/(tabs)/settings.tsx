/**
 * Admin — Settings (Bank Configuration)
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, Switch, Alert,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers';
import { useMutationGuard } from '@/hooks';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET, APP_NAME } from '@/constants';
import { LoadingSkeleton } from '@/components/ui';
import type { BankSettings } from '@/types';

export default function AdminSettingsScreen() {
  const { profile, signOut } = useAuth();
  const { isMutating, guard } = useMutationGuard();
  const [settings, setSettings] = useState<BankSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    bank_name: '', beneficiary: '', clabe: '',
    default_amount: '', payment_minutes: '', deposits_enabled: true,
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('bank_settings').select('*').limit(1).single();
    if (data) {
      const s = data as BankSettings;
      setSettings(s);
      setForm({
        bank_name: s.bank_name, beneficiary: s.beneficiary, clabe: s.clabe,
        default_amount: s.default_amount.toString(), payment_minutes: s.payment_minutes.toString(),
        deposits_enabled: s.deposits_enabled,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = useCallback(async () => {
    if (!settings) return;
    await guard(async () => {
      const { error } = await supabase.from('bank_settings').update({
        bank_name: form.bank_name.trim(),
        beneficiary: form.beneficiary.trim(),
        clabe: form.clabe.trim(),
        default_amount: parseFloat(form.default_amount) || 0,
        payment_minutes: parseInt(form.payment_minutes) || 120,
        deposits_enabled: form.deposits_enabled,
        updated_at: new Date().toISOString(),
        updated_by: profile?.id,
      }).eq('id', settings.id);

      if (error) Alert.alert('Error', error.message);
      else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Guardado', 'Configuración actualizada correctamente.');
        await fetch();
      }
    });
  }, [settings, form, profile, guard, fetch]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Ajustes</Text>

        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.sectionTitle}>Datos bancarios</Text>
          <Text style={styles.sectionSub}>Solo visibles para peluqueros al verificar comprobantes.</Text>

          {loading ? (
            <View style={styles.skeletons}>
              {[1, 2, 3, 4, 5].map((i) => <LoadingSkeleton key={i} height={44} />)}
            </View>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Banco</Text>
                <TextInput
                  style={styles.input} value={form.bank_name}
                  onChangeText={(v) => setForm((f) => ({ ...f, bank_name: v }))}
                  placeholder="Nombre del banco" placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Beneficiario</Text>
                <TextInput
                  style={styles.input} value={form.beneficiary}
                  onChangeText={(v) => setForm((f) => ({ ...f, beneficiary: v }))}
                  placeholder="Nombre del beneficiario" placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>CLABE</Text>
                <TextInput
                  style={styles.input} value={form.clabe}
                  onChangeText={(v) => setForm((f) => ({ ...f, clabe: v }))}
                  placeholder="18 dígitos" placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad" maxLength={18}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Monto predeterminado ($)</Text>
                <TextInput
                  style={styles.input} value={form.default_amount}
                  onChangeText={(v) => setForm((f) => ({ ...f, default_amount: v }))}
                  keyboardType="decimal-pad" placeholder="200"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Minutos para pagar</Text>
                <TextInput
                  style={styles.input} value={form.payment_minutes}
                  onChangeText={(v) => setForm((f) => ({ ...f, payment_minutes: v }))}
                  keyboardType="number-pad" placeholder="120"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Anticipos activos</Text>
                <Switch
                  value={form.deposits_enabled}
                  onValueChange={(v) => setForm((f) => ({ ...f, deposits_enabled: v }))}
                  trackColor={{ false: colors.disabled, true: colors.oliveGold }}
                  thumbColor={colors.surface}
                />
              </View>
              <Pressable
                style={[styles.saveBtn, isMutating && styles.saveBtnDisabled]}
                onPress={handleSave} disabled={isMutating}
              >
                {isMutating ? <ActivityIndicator color={colors.surface} /> : (
                  <Text style={styles.saveBtnText}>Guardar cambios</Text>
                )}
              </Pressable>
            </>
          )}
        </View>

        <Pressable style={[styles.signOutBtn, shadows.sm]} onPress={signOut}>
          <MaterialCommunityIcons name="logout" size={20} color={colors.danger} />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing['3xl'] },
  title: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1, color: colors.graphite, marginBottom: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl, marginBottom: spacing.xl },
  sectionTitle: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title3, color: colors.graphite },
  sectionSub: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.subheadline,
    color: colors.placeholder, marginBottom: spacing.lg,
  },
  skeletons: { gap: spacing.md },
  field: { marginBottom: spacing.base },
  label: { fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.subheadline, color: colors.graphite, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.background, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.base, minHeight: MIN_TOUCH_TARGET, fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body, color: colors.graphite,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  saveBtn: { backgroundColor: colors.walnut, borderRadius: radii.lg, minHeight: MIN_TOUCH_TARGET + 4, alignItems: 'center', justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.callout, color: colors.surface },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderRadius: radii.xl, minHeight: MIN_TOUCH_TARGET + 4,
    gap: spacing.sm, borderWidth: 1, borderColor: '#EFC6C2',
  },
  signOutText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.callout, color: colors.danger },
});
