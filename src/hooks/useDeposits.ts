/**
 * Hook: useDeposits
 *
 * Fetches deposits with proof review status,
 * provides approve/reject mutations,
 * and subscribes to Realtime changes on the deposits table.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Deposit, DepositStatus } from '@/types';

interface UseDepositsOptions {
  /** Filter by status (e.g. 'comprobante_recibido' for pending review) */
  status?: DepositStatus | null;
  /** Filter by client */
  clientId?: string | null;
  /** Optionally disable the hook */
  enabled?: boolean;
}

interface UseDepositsReturn {
  deposits: Deposit[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  approveDeposit: (id: string, verifiedBy: string) => Promise<{ error: string | null }>;
  rejectDeposit: (id: string, verifiedBy: string, reason: string) => Promise<{ error: string | null }>;
}

export function useDeposits({
  status = null,
  clientId = null,
  enabled = true,
}: UseDepositsOptions = {}): UseDepositsReturn {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) {
      setDeposits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }
      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setDeposits([]);
      } else {
        setDeposits((data as Deposit[]) ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [status, clientId, enabled]);

  // Initial fetch
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Realtime subscription
  useEffect(() => {
    if (!enabled) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('deposits:review')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deposits' },
        () => {
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
  }, [enabled, fetch]);

  const approveDeposit = useCallback(
    async (id: string, verifiedBy: string): Promise<{ error: string | null }> => {
      const { error: updateError } = await supabase
        .from('deposits')
        .update({
          status: 'verificado' as DepositStatus,
          verified_by: verifiedBy,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) return { error: updateError.message };
      await fetch();
      return { error: null };
    },
    [fetch],
  );

  const rejectDeposit = useCallback(
    async (id: string, verifiedBy: string, reason: string): Promise<{ error: string | null }> => {
      const { error: updateError } = await supabase
        .from('deposits')
        .update({
          status: 'rechazado' as DepositStatus,
          verified_by: verifiedBy,
          verified_at: new Date().toISOString(),
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) return { error: updateError.message };
      await fetch();
      return { error: null };
    },
    [fetch],
  );

  return { deposits, loading, error, refresh: fetch, approveDeposit, rejectDeposit };
}
