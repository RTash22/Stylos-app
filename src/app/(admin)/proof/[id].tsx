/**
 * Admin — Proof Detail / Review Screen
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, Alert,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers';
import { useMutationGuard } from '@/hooks';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';
import { ProofViewer } from '@/components/deposits';
import { ConfirmActionDialog } from '@/components/ui';
import type { Deposit, Appointment, Client } from '@/types';

export default function AdminProofDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { isMutating, guard } = useMutationGuard();

  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    // Fetch deposit
    const { data: depositData } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', id)
      .single();

    if (depositData) {
      const d = depositData as Deposit;
      setDeposit(d);

      // Fetch related appointment
      const { data: aptData } = await supabase
        .from('appointments')
        .select('*, client:clients(*), service:services(*)')
        .eq('id', d.appointment_id)
        .single();

      if (aptData) {
        setAppointment(aptData as Appointment);
        setClient((aptData as Appointment).client ?? null);
      }

      // Also fetch client directly if not from appointment
      if (!aptData?.client && d.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', d.client_id)
          .single();
        if (clientData) setClient(clientData as Client);
      }
    }

    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = useCallback(async () => {
    if (!deposit || !profile) return;

    await guard(async () => {
      const { error } = await supabase
        .from('deposits')
        .update({
          status: 'aprobado',
          verified_by: profile.id,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', deposit.id);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Aprobado', 'El comprobante ha sido verificado.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    });
  }, [deposit, profile, guard, router]);

  const handleReject = useCallback(async () => {
    if (!deposit || !profile || !rejectionReason.trim()) return;

    await guard(async () => {
      const { error } = await supabase
        .from('deposits')
        .update({
          status: 'rechazado',
          verified_by: profile.id,
          verified_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', deposit.id);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setShowRejectDialog(false);
        Alert.alert('Rechazado', 'El comprobante ha sido rechazado.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    });
  }, [deposit, profile, rejectionReason, guard, router]);

  const amount = deposit?.amount?.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }) ?? '$0.00';

  const isReviewable = deposit?.status === 'comprobante_recibido';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{
        headerShown: true,
        title: 'Revisar comprobante',
        headerTintColor: colors.walnut,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.headline, color: colors.graphite },
      }} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.walnut} />
        </View>
      ) : !deposit ? (
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="file-alert-outline" size={48} color={colors.danger} />
          <Text style={styles.errorText}>Comprobante no encontrado</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Client & Appointment Info */}
          <View style={[styles.infoCard, shadows.sm]}>
            <Text style={styles.sectionTitle}>Información</Text>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={18} color={colors.walnut} />
              <Text style={styles.infoLabel}>Cliente:</Text>
              <Text style={styles.infoValue}>{client?.full_name ?? 'Desconocido'}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="cash" size={18} color={colors.success} />
              <Text style={styles.infoLabel}>Monto:</Text>
              <Text style={styles.infoValue}>{amount}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="pound" size={18} color={colors.icon} />
              <Text style={styles.infoLabel}>Referencia:</Text>
              <Text style={styles.infoValue}>{deposit.reference || 'Sin referencia'}</Text>
            </View>

            {appointment?.service && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="content-cut" size={18} color={colors.icon} />
                <Text style={styles.infoLabel}>Servicio:</Text>
                <Text style={styles.infoValue}>{appointment.service.name}</Text>
              </View>
            )}

            {deposit.proof_uploaded_at && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar-clock" size={18} color={colors.icon} />
                <Text style={styles.infoLabel}>Subido:</Text>
                <Text style={styles.infoValue}>
                  {new Date(deposit.proof_uploaded_at).toLocaleString('es-MX', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Proof Image */}
          <View style={styles.proofSection}>
            <Text style={styles.sectionTitle}>Comprobante</Text>
            <ProofViewer proofPath={deposit.proof_path} />
          </View>

          {/* Action Buttons */}
          {isReviewable && (
            <View style={styles.actions}>
              <Pressable
                style={[styles.approveBtn, isMutating && styles.btnDisabled]}
                onPress={handleApprove}
                disabled={isMutating}
              >
                {isMutating ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.surface} />
                    <Text style={styles.approveBtnText}>Aprobar</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={[styles.rejectBtn, isMutating && styles.btnDisabled]}
                onPress={() => setShowRejectDialog(true)}
                disabled={isMutating}
              >
                <MaterialCommunityIcons name="close-circle" size={20} color={colors.danger} />
                <Text style={styles.rejectBtnText}>Rechazar</Text>
              </Pressable>
            </View>
          )}

          {/* Already reviewed status */}
          {deposit.status === 'verificado' && (
            <View style={[styles.statusBanner, { backgroundColor: '#EFF5E8' }]}>
              <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
              <Text style={[styles.statusBannerText, { color: colors.success }]}>
                Comprobante verificado
              </Text>
            </View>
          )}

          {deposit.status === 'rechazado' && (
            <View style={[styles.statusBanner, { backgroundColor: '#FCEAE8' }]}>
              <MaterialCommunityIcons name="close-circle" size={24} color={colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusBannerText, { color: colors.danger }]}>
                  Comprobante rechazado
                </Text>
                {deposit.rejection_reason && (
                  <Text style={styles.rejectionReasonText}>
                    Motivo: {deposit.rejection_reason}
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Reject Dialog */}
      <ConfirmActionDialog
        visible={showRejectDialog}
        title="Rechazar comprobante"
        message="Escribe el motivo del rechazo. El cliente será notificado."
        confirmLabel="Rechazar"
        isDestructive
        loading={isMutating}
        onConfirm={handleReject}
        onCancel={() => { setShowRejectDialog(false); setRejectionReason(''); }}
      >
        <TextInput
          style={styles.rejectInput}
          value={rejectionReason}
          onChangeText={setRejectionReason}
          placeholder="Motivo del rechazo..."
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </ConfirmActionDialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  errorText: { fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.body, color: colors.danger },
  content: { padding: spacing.xl, paddingBottom: spacing['3xl'] },
  infoCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.headline,
    color: colors.graphite, marginBottom: spacing.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  infoLabel: { fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.subheadline, color: colors.icon },
  infoValue: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.body, color: colors.graphite, flex: 1 },
  proofSection: { marginBottom: spacing.xl },
  actions: { gap: spacing.md, marginBottom: spacing.xl },
  approveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.success, borderRadius: radii.lg, minHeight: MIN_TOUCH_TARGET + 8,
  },
  approveBtnText: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.callout, color: colors.surface },
  rejectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radii.lg, minHeight: MIN_TOUCH_TARGET + 4,
    borderWidth: 1, borderColor: '#EFC6C2',
  },
  rejectBtnText: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.callout, color: colors.danger },
  btnDisabled: { opacity: 0.5 },
  rejectInput: {
    backgroundColor: colors.background, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm, fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body, color: colors.graphite, minHeight: 80, marginTop: spacing.md,
  },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.lg, borderRadius: radii.xl, marginBottom: spacing.xl,
  },
  statusBannerText: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.callout },
  rejectionReasonText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.subheadline,
    color: colors.danger, marginTop: spacing.xs,
  },
});
