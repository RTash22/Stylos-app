/**
 * Hook: useTimeBlocks
 *
 * Fetches manual time blocks for a barber in a date range.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { TimeBlock } from '@/types';
import { startOfDay, endOfDay } from '@/utils/dates';

interface UseTimeBlocksOptions {
  barberId: string | null;
  dateStart: Date;
  dateEnd: Date;
}

interface UseTimeBlocksReturn {
  timeBlocks: TimeBlock[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (block: Omit<TimeBlock, 'id' | 'created_at'>) => Promise<{ error: string | null }>;
  remove: (id: string) => Promise<{ error: string | null }>;
}

export function useTimeBlocks({
  barberId,
  dateStart,
  dateEnd,
}: UseTimeBlocksOptions): UseTimeBlocksReturn {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!barberId) {
      setTimeBlocks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('barber_id', barberId)
        .gte('starts_at', startOfDay(dateStart).toISOString())
        .lte('starts_at', endOfDay(dateEnd).toISOString())
        .order('starts_at', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTimeBlocks((data as TimeBlock[]) ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [barberId, dateStart.toISOString(), dateEnd.toISOString()]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (block: Omit<TimeBlock, 'id' | 'created_at'>): Promise<{ error: string | null }> => {
      const { error: insertError } = await supabase
        .from('time_blocks')
        .insert(block);

      if (insertError) {
        return { error: insertError.message };
      }

      await fetch();
      return { error: null };
    },
    [fetch],
  );

  const remove = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const { error: deleteError } = await supabase
        .from('time_blocks')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return { error: deleteError.message };
      }

      await fetch();
      return { error: null };
    },
    [fetch],
  );

  return { timeBlocks, loading, error, refresh: fetch, create, remove };
}
