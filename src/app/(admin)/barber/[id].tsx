/**
 * Admin — Barber Detail
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { useMutationGuard } from '@/hooks';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';
import { LoadingSkeleton, ConfirmActionDialog } from '@/components/ui';
import type { Profile } from '@/types';

export default function AdminBarberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isMutating, guard } = useMutationGuard();
  const [barber, setBarber] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggleDialog, setToggleDialog] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    setBarber(data as Profile);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggleActive = useCallback(async () => {
    if (!barber) return;
    await guard(async () => {
      const { error } = await supabase.from('profiles').update({ is_active: !barber.is_active }).eq('id', barber.id);
      if (error) Alert.alert('Error', error.message);
      else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await fetch();
      }
      setToggleDialog(false);
    });
  }, [barber, guard, fetch]);

  if (loading) return <SafeAreaView style={styles.container}><View style={styles.pad}><LoadingSkeleton height={200} /></View></SafeAreaView>;
  if (!barber) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.graphite} />
        </Pressable>
        <Text style={styles.headerTitle}>Peluquero</Text>
        <View style={{ width: MIN_TOUCH_TARGET }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, shadows.md]}>
          <View style={styles.avatarLg}>
            <Text style={styles.avatarText}>{barber.full_name[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{barber.full_name}</Text>
          <Text style={[styles.statusText, { color: barber.is_active ? colors.success : colors.danger }]}>
            {barber.is_active ? 'Activo' : 'Inactivo'}
          </Text>
          {barber.phone && <Text style={styles.phone}>{barber.phone}</Text>}
        </View>

        <Pressable
          style={[styles.actionBtn, barber.is_active ? styles.dangerOutline : styles.successOutline]}
          onPress={() => setToggleDialog(true)}
        >
          <MaterialCommunityIcons
            name={barber.is_active ? 'account-off' : 'account-check'}
            size={20}
            color={barber.is_active ? colors.danger : colors.success}
          />
          <Text style={[styles.actionBtnText, { color: barber.is_active ? colors.danger : colors.success }]}>
            {barber.is_active ? 'Desactivar peluquero' : 'Activar peluquero'}
          </Text>
        </Pressable>
      </ScrollView>

      <ConfirmActionDialog
        visible={toggleDialog}
        title={barber.is_active ? 'Desactivar peluquero' : 'Activar peluquero'}
        message={`¿${barber.is_active ? 'Desactivar' : 'Activar'} a ${barber.full_name}?`}
        isDestructive={barber.is_active}
        loading={isMutating}
        onConfirm={handleToggleActive}
        onCancel={() => setToggleDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pad: { padding: spacing.xl },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, ...shadows.sm,
  },
  backBtn: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.headline, color: colors.graphite },
  scrollContent: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing['3xl'] },
  card: {
    backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl,
    alignItems: 'center', gap: spacing.sm,
  },
  avatarLg: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.paleSage,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1, color: colors.walnut },
  name: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title3, color: colors.graphite },
  statusText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.body },
  phone: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body, color: colors.icon },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET + 4, borderRadius: radii.lg, gap: spacing.sm,
    borderWidth: 1,
  },
  dangerOutline: { borderColor: colors.danger, backgroundColor: colors.surface },
  successOutline: { borderColor: colors.success, backgroundColor: colors.surface },
  actionBtnText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.callout },
});
