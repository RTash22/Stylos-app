/**
 * Hook: useRealtimeSubscription
 *
 * Generic hook for subscribing to Supabase Realtime
 * on any table with automatic cleanup.
 */
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface UseRealtimeOptions {
  /** Unique channel name */
  channelName: string;
  /** Table to listen to */
  table: string;
  /** Optional filter (e.g. `barber_id=eq.abc123`) */
  filter?: string;
  /** Event type to listen for */
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  /** Callback on any matching change */
  onPayload: (payload: unknown) => void;
  /** Enable/disable subscription */
  enabled?: boolean;
}

export function useRealtimeSubscription({
  channelName,
  table,
  filter,
  event = '*',
  onPayload,
  enabled = true,
}: UseRealtimeOptions): void {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Cleanup previous
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          onPayload(payload);
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
  }, [channelName, table, filter, event, enabled, onPayload]);
}
