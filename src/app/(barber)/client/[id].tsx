/**
 * Client Detail Screen (Barber view)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET, STRIKE_THRESHOLD } from '@/constants';
import { StatusBadge, LoadingSkeleton, ErrorState } from '@/components/ui';
import { formatFullDate, formatTime, toLocalDate } from '@/utils/dates';
import type { Client, Appointment, AestheticNote } from '@/types';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState<AestheticNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [clientRes, aptsRes, notesRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).single(),
        supabase.from('appointments').select('*, service:services(*)').eq('client_id', id).order('starts_at', { ascending: false }).limit(20),
        supabase.from('aesthetic_notes').select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(20),
      ]);
      if (clientRes.error) setError(clientRes.error.message);
      else setClient(clientRes.data as Client);
      setAppointments((aptsRes.data as Appointment[]) ?? []);
      setNotes((notesRes.data as AestheticNote[]) ?? []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SafeAreaView style={styles.container}><View style={styles.pad}><LoadingSkeleton height={120} /><LoadingSkeleton height={200} /></View></SafeAreaView>;
  if (error || !client) return <ErrorState message={error ?? 'Cliente no encontrado'} onRetry={fetch} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.graphite} />
        </Pressable>
        <Text style={styles.headerTitle}>Cliente</Text>
        <View style={{ width: MIN_TOUCH_TARGET }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Client Card */}
        <View style={[styles.card, shadows.sm]}>
          <View style={styles.avatarLg}>
            <Text style={styles.avatarText}>{client.full_name[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.clientName}>{client.full_name}</Text>
          <Text style={styles.clientPhone}>
            {client.phone ? `${client.phone.slice(0, 4)}••••${client.phone.slice(-2)}` : 'Sin teléfono'}
          </Text>
          {client.strikes > 0 && (
            <View style={styles.strikeBadge}>
              <MaterialCommunityIcons name="alert" size={16} color={colors.danger} />
              <Text style={styles.strikeText}>
                {client.strikes} strike{client.strikes > 1 ? 's' : ''}
                {client.strikes >= STRIKE_THRESHOLD ? ' · Requiere anticipo' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* History */}
        <Text style={styles.sectionTitle}>Historial estético</Text>
        {notes.length === 0 ? (
          <Text style={styles.emptyText}>Sin notas de historial.</Text>
        ) : (
          notes.map((note) => (
            <View key={note.id} style={[styles.noteCard, shadows.sm]}>
              <Text style={styles.noteProc}>{note.procedure}</Text>
              {note.products_used && <Text style={styles.noteDetail}>Productos: {note.products_used}</Text>}
              {note.observations && <Text style={styles.noteDetail}>Obs: {note.observations}</Text>}
              {note.recommendations && <Text style={styles.noteDetail}>Rec: {note.recommendations}</Text>}
              <Text style={styles.noteDate}>{formatFullDate(toLocalDate(note.created_at))}</Text>
            </View>
          ))
        )}

        {/* Recent Appointments */}
        <Text style={styles.sectionTitle}>Últimas citas</Text>
        {appointments.length === 0 ? (
          <Text style={styles.emptyText}>Sin citas registradas.</Text>
        ) : (
          appointments.map((apt) => (
            <Pressable key={apt.id} style={[styles.aptCard, shadows.sm]} onPress={() => router.push(`/(barber)/appointment/${apt.id}`)}>
              <View style={styles.aptRow}>
                <Text style={styles.aptDate}>{formatFullDate(toLocalDate(apt.starts_at))}</Text>
                <StatusBadge status={apt.status} size="sm" />
              </View>
              <Text style={styles.aptService}>{apt.service?.name ?? '—'} · {formatTime(toLocalDate(apt.starts_at))}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pad: { padding: spacing.xl, gap: spacing.md },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, ...shadows.sm,
  },
  backBtn: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.headline, color: colors.graphite },
  scrollContent: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing['3xl'] },
  card: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  avatarLg: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.paleSage, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title2, color: colors.walnut },
  clientName: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title3, color: colors.graphite },
  clientPhone: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body, color: colors.icon },
  strikeBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: '#FCEAE8', borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  strikeText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.footnote, color: colors.danger },
  sectionTitle: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title3, color: colors.graphite, marginTop: spacing.md },
  emptyText: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body, color: colors.placeholder },
  noteCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs },
  noteProc: { fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.body, color: colors.graphite },
  noteDetail: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.subheadline, color: colors.icon },
  noteDate: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.caption, color: colors.placeholder },
  aptCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs },
  aptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aptDate: { fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.body, color: colors.graphite },
  aptService: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.subheadline, color: colors.icon },
});
