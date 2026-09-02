/**
 * Availability Screen — Manage working hours and time blocks.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, Switch, Alert, StyleSheet,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/providers';
import { useWorkingHours, useTimeBlocks, useMutationGuard } from '@/hooks';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';
import { LoadingSkeleton, ConfirmActionDialog } from '@/components/ui';
import { formatFullDate, formatTime, toLocalDate, nowLocal, addDays, startOfDay, endOfDay } from '@/utils/dates';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function AvailabilityScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { workingHours, loading, update } = useWorkingHours(profile?.id ?? null);
  const { timeBlocks, refresh: refreshBlocks, remove: removeBlock } = useTimeBlocks({
    barberId: profile?.id ?? null,
    dateStart: startOfDay(nowLocal()),
    dateEnd: endOfDay(addDays(nowLocal(), 30)),
  });
  const { isMutating, guard } = useMutationGuard();
  const [deleteDialog, setDeleteDialog] = useState<{ visible: boolean; blockId: string | null }>({ visible: false, blockId: null });

  const handleToggleDay = useCallback(async (whId: string, currentActive: boolean) => {
    await guard(async () => {
      const result = await update(whId, { is_active: !currentActive });
      if (result.error) Alert.alert('Error', result.error);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });
  }, [guard, update]);

  const handleDeleteBlock = useCallback(async () => {
    if (!deleteDialog.blockId) return;
    await guard(async () => {
      const result = await removeBlock(deleteDialog.blockId!);
      if (result.error) Alert.alert('Error', result.error);
      else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshBlocks();
      }
      setDeleteDialog({ visible: false, blockId: null });
    });
  }, [deleteDialog.blockId, guard, removeBlock, refreshBlocks]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.graphite} />
        </Pressable>
        <Text style={styles.headerTitle}>Mi horario</Text>
        <View style={{ width: MIN_TOUCH_TARGET }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Horario semanal</Text>

        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => <LoadingSkeleton key={i} height={56} />)
        ) : (
          workingHours.map((wh) => (
            <View key={wh.id} style={[styles.dayCard, shadows.sm]}>
              <View style={styles.dayRow}>
                <Text style={[styles.dayName, !wh.is_active && styles.dayNameInactive]}>
                  {DAY_NAMES[wh.day_of_week]}
                </Text>
                <Switch
                  value={wh.is_active}
                  onValueChange={() => handleToggleDay(wh.id, wh.is_active)}
                  trackColor={{ false: colors.disabled, true: colors.oliveGold }}
                  thumbColor={colors.surface}
                  disabled={isMutating}
                />
              </View>
              {wh.is_active && (
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>{wh.start_local_time} – {wh.end_local_time}</Text>
                </View>
              )}
            </View>
          ))
        )}

        {/* Time Blocks */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Bloqueos temporales</Text>
        {timeBlocks.length === 0 ? (
          <Text style={styles.emptyText}>Sin bloqueos programados.</Text>
        ) : (
          timeBlocks.map((tb) => (
            <View key={tb.id} style={[styles.blockCard, shadows.sm]}>
              <View style={styles.blockInfo}>
                <Text style={styles.blockDate}>
                  {formatFullDate(toLocalDate(tb.start_time))} · {formatTime(toLocalDate(tb.start_time))} – {formatTime(toLocalDate(tb.end_time))}
                </Text>
                <Text style={styles.blockReason}>{tb.reason || 'Bloqueado'}</Text>
              </View>
              <Pressable
                style={styles.deleteBtn}
                onPress={() => setDeleteDialog({ visible: true, blockId: tb.id })}
              >
                <MaterialCommunityIcons name="delete-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <ConfirmActionDialog
        visible={deleteDialog.visible}
        title="Eliminar bloqueo"
        message="¿Eliminar este bloqueo temporal?"
        isDestructive
        loading={isMutating}
        onConfirm={handleDeleteBlock}
        onCancel={() => setDeleteDialog({ visible: false, blockId: null })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, ...shadows.sm,
  },
  backBtn: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.headline, color: colors.graphite },
  scrollContent: { padding: spacing.xl, gap: spacing.sm, paddingBottom: spacing['3xl'] },
  sectionTitle: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title3, color: colors.graphite, marginBottom: spacing.sm },
  dayCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md },
  dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayName: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.body, color: colors.graphite },
  dayNameInactive: { color: colors.disabled },
  timeRow: { marginTop: spacing.xs },
  timeText: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.subheadline, color: colors.icon },
  emptyText: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body, color: colors.placeholder },
  blockCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md },
  blockInfo: { flex: 1 },
  blockDate: { fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.body, color: colors.graphite },
  blockReason: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.subheadline, color: colors.icon },
  deleteBtn: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
});
