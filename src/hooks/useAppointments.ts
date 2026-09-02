/**
 * Hook: useAppointments
 *
 * Fetches appointments for a barber within a date range,
 * subscribes to Realtime changes, and provides mutation helpers.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Appointment, AppointmentStatus } from '@/types';
import { startOfDay, endOfDay } from '@/utils/dates';

interface UseAppointmentsOptions {
  barberId: string | null;
  dateStart: Date;
  dateEnd: Date;
  enabled?: boolean;
}

interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateStatus: (id: string, status: AppointmentStatus, extra?: Record<string, unknown>) => Promise<{ error: string | null }>;
}

export function useAppointments({
  barberId,
  dateStart,
  dateEnd,
  enabled = true,
}: UseAppointmentsOptions): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetch = useCallback(async () => {
    if (!barberId || !enabled) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*, client:clients(*), service:services(*)')
        .eq('barber_id', barberId)
        .gte('start_time', startOfDay(dateStart).toISOString())
        .lte('start_time', endOfDay(dateEnd).toISOString())
        .order('start_time', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setAppointments([]);
      } else {
        setAppointments((data as Appointment[]) ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [barberId, dateStart.toISOString(), dateEnd.toISOString(), enabled]);

  // Initial fetch
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Realtime subscription
  useEffect(() => {
    if (!barberId || !enabled) return;

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`appointments:barber:${barberId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `barber_id=eq.${barberId}`,
        },
        () => {
          // Reconcile with a fresh fetch on any change
          fetch();
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [barberId, enabled, fetch]);

  const updateStatus = useCallback(
    async (
      id: string,
      status: AppointmentStatus,
      extra?: Record<string, unknown>,
    ): Promise<{ error: string | null }> => {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status, ...extra, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        return { error: updateError.message };
      }

      // Refresh to get the latest state
      await fetch();
      return { error: null };
    },
    [fetch],
  );

  return { appointments, loading, error, refresh: fetch, updateStatus };
}
