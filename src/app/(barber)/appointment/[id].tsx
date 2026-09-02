/**
 * Appointment Detail Screen — Barber view.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers';
import { useMutationGuard } from '@/hooks';
import { useAestheticNotes } from '@/hooks/useAestheticNotes';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';
import { StatusBadge, ConfirmActionDialog, LoadingSkeleton, ErrorState } from '@/components/ui';
import { AestheticNoteCard } from '@/components/appointments';
import { getAvailableTransitions, STATUS_LABELS } from '@/utils/stateMachine';
import { formatTime, formatFullDate, toLocalDate } from '@/utils/dates';
import type { Appointment, AppointmentStatus } from '@/types';

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile, role } = useAuth();
  const { isMutating, guard } = useMutationGuard();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Completion note state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [procedure, setProcedure] = useState('');
  const [products, setProducts] = useState('');
  const [observations, setObservations] = useState('');
  const [recommendations, setRecommendations] = useState('');

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
    isDestructive: boolean;
  }>({ visible: false, title: '', message: '', action: async () => {}, isDestructive: false });

  const fetchAppointment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error: e } = await supabase
        .from('appointments')
        .select('*, client:clients(*), service:services(*)')
        .eq('id', id)
        .single();
      if (e) setError(e.message);
      else setAppointment(data as Appointment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchAppointment(); }, [fetchAppointment]);

  // Fetch aesthetic notes for this appointment
  const { notes: aestheticNotes, loading: notesLoading } = useAestheticNotes({
    appointmentId: id,
    enabled: !!id,
  });

  const updateStatus = useCallback(async (newStatus: AppointmentStatus, extra?: Record<string, unknown>) => {
    if (!appointment) return;
    await guard(async () => {
      const { error: e } = await supabase
        .from('appointments')
        .update({ status: newStatus, ...extra, updated_at: new Date().toISOString() })
        .eq('id', appointment.id);
      if (e) {
        Alert.alert('Error', e.message);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await fetchAppointment();
      }
    });
  }, [appointment, guard, fetchAppointment]);

  const handleComplete = useCallback(async () => {
    if (!procedure.trim()) {
      Alert.alert('Nota requerida', 'Ingresa al menos el procedimiento realizado.');
      return;
    }
    if (!appointment) return;

    await guard(async () => {
      // Save aesthetic note
      const { error: noteErr } = await supabase.from('aesthetic_notes').insert({
        client_id: appointment.client_id,
        appointment_id: appointment.id,
        barber_id: profile?.id,
        procedure: procedure.trim(),
        products_used: products.trim() || null,
        observations: observations.trim() || null,
        recommendations: recommendations.trim() || null,
      });
      if (noteErr) { Alert.alert('Error', noteErr.message); return; }

      // Update status
      await updateStatus('completada');
      setShowNoteForm(false);
    });
  }, [appointment, procedure, products, observations, recommendations, profile, guard, updateStatus]);

  const handleNoShow = useCallback(() => {
    setConfirmDialog({
      visible: true,
      title: 'Marcar como no asistió',
      message: 'Esta acción incrementará el strike del cliente. ¿Confirmas?',
      isDestructive: true,
      action: async () => {
        await updateStatus('no_asistio');
        setConfirmDialog((d) => ({ ...d, visible: false }));
      },
    });
  }, [updateStatus]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skeletons}>
          <LoadingSkeleton height={120} />
          <LoadingSkeleton height={60} />
          <LoadingSkeleton height={200} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !appointment) {
    return <ErrorState message={error ?? 'Cita no encontrada'} onRetry={fetchAppointment} />;
  }

  const transitions = getAvailableTransitions(appointment.status, role ?? 'peluquero');
  const startDate = toLocalDate(appointment.start_time);
  const endDate = toLocalDate(appointment.end_time);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.graphite} />
        </Pressable>
        <Text style={styles.headerTitle}>Detalle de cita</Text>
        <View style={{ width: MIN_TOUCH_TARGET }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status */}
        <View style={[styles.card, shadows.sm]}>
          <StatusBadge status={appointment.status} />
          <Text style={styles.dateLabel}>{formatFullDate(startDate)}</Text>
          <Text style={styles.timeLabel}>{formatTime(startDate)} – {formatTime(endDate)}</Text>
        </View>

        {/* Client */}
        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={18} color={colors.walnut} />
            <Text style={styles.infoText}>{appointment.client?.full_name ?? '—'}</Text>
          </View>
          {appointment.client?.phone_e164 && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={18} color={colors.icon} />
              <Text style={styles.infoText}>
                {appointment.client.phone_e164.slice(0, 4)}••••{appointment.client.phone_e164.slice(-2)}
              </Text>
            </View>
          )}
          {(appointment.client?.strikes ?? 0) > 0 && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="alert" size={18} color={colors.danger} />
              <Text style={[styles.infoText, { color: colors.danger }]}>
                {appointment.client?.strikes} strike{(appointment.client?.strikes ?? 0) > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Service */}
        {appointment.service && (
          <View style={[styles.card, shadows.sm]}>
            <Text style={styles.sectionTitle}>Servicio</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="content-cut" size={18} color={colors.oliveGold} />
              <Text style={styles.infoText}>{appointment.service.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="timer-outline" size={18} color={colors.icon} />
              <Text style={styles.infoText}>{appointment.service.duration_minutes} min</Text>
            </View>
          </View>
        )}

        {/* Customer Notes */}
        {appointment.customer_notes && (
          <View style={[styles.card, shadows.sm]}>
            <Text style={styles.sectionTitle}>Notas del cliente</Text>
            <Text style={styles.notesText}>{appointment.customer_notes}</Text>
          </View>
        )}

        {/* Aesthetic notes for completed appointments */}
        {appointment.status === 'completada' && aestheticNotes.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.xs }]}>Historial estético</Text>
            {aestheticNotes.map((note) => (
              <AestheticNoteCard key={note.id} note={note} />
            ))}
          </View>
        )}

        {/* Completion note form */}
        {showNoteForm && (
          <View style={[styles.card, shadows.sm]}>
            <Text style={styles.sectionTitle}>Nota de historial *</Text>
            <TextInput
              style={styles.noteInput}
              value={procedure}
              onChangeText={setProcedure}
              placeholder="Procedimiento realizado *"
              placeholderTextColor={colors.placeholder}
              multiline
            />
            <TextInput
              style={styles.noteInput}
              value={products}
              onChangeText={setProducts}
              placeholder="Productos utilizados"
              placeholderTextColor={colors.placeholder}
              multiline
            />
            <TextInput
              style={styles.noteInput}
              value={observations}
              onChangeText={setObservations}
              placeholder="Observaciones"
              placeholderTextColor={colors.placeholder}
              multiline
            />
            <TextInput
              style={styles.noteInput}
              value={recommendations}
              onChangeText={setRecommendations}
              placeholder="Recomendaciones"
              placeholderTextColor={colors.placeholder}
              multiline
            />
            <Pressable
              style={[styles.primaryBtn, isMutating && styles.btnDisabled]}
              onPress={handleComplete}
              disabled={isMutating}
            >
              {isMutating ? <ActivityIndicator color={colors.surface} /> : (
                <Text style={styles.primaryBtnText}>Completar cita</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Action Buttons */}
        {transitions.length > 0 && !showNoteForm && (
          <View style={styles.actionsSection}>
            {transitions.map((t) => {
              const isDestructive = ['no_asistio', 'rechazada', 'cancelada'].includes(t.to);
              const onPress = () => {
                if (t.to === 'completada') {
                  setShowNoteForm(true);
                  return;
                }
                if (t.to === 'no_asistio') {
                  handleNoShow();
                  return;
                }
                if (t.requiresConfirmation) {
                  setConfirmDialog({
                    visible: true,
                    title: t.label,
                    message: `¿Confirmas la acción "${t.label}"?`,
                    isDestructive,
                    action: async () => {
                      await updateStatus(t.to);
                      setConfirmDialog((d) => ({ ...d, visible: false }));
                    },
                  });
                } else {
                  updateStatus(t.to);
                }
              };

              return (
                <Pressable
                  key={t.to}
                  style={[
                    isDestructive ? styles.dangerBtn : styles.primaryBtn,
                    isMutating && styles.btnDisabled,
                  ]}
                  onPress={onPress}
                  disabled={isMutating}
                >
                  <Text style={isDestructive ? styles.dangerBtnText : styles.primaryBtnText}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <ConfirmActionDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
        loading={isMutating}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((d) => ({ ...d, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.surface, ...shadows.sm,
  },
  backBtn: {
    width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, borderRadius: radii.full,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.headline, color: colors.graphite,
  },
  scrollContent: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing['3xl'] },
  card: {
    backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.headline, color: colors.graphite,
    marginBottom: spacing.xs,
  },
  dateLabel: {
    fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.body, color: colors.graphite,
  },
  timeLabel: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body, color: colors.icon,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body, color: colors.graphite,
  },
  notesText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body,
    color: colors.icon, lineHeight: typography.lineHeights.body,
  },
  noteInput: {
    backgroundColor: colors.background, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body,
    color: colors.graphite, minHeight: 60, textAlignVertical: 'top',
  },
  actionsSection: { gap: spacing.sm, marginTop: spacing.md },
  primaryBtn: {
    backgroundColor: colors.walnut, borderRadius: radii.lg,
    minHeight: MIN_TOUCH_TARGET + 4, alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.callout, color: colors.surface,
  },
  dangerBtn: {
    backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.danger,
    minHeight: MIN_TOUCH_TARGET + 4, alignItems: 'center', justifyContent: 'center',
  },
  dangerBtnText: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.callout, color: colors.danger,
  },
  btnDisabled: { opacity: 0.5 },
  skeletons: { padding: spacing.xl, gap: spacing.md },
});
