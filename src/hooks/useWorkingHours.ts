/**
 * Hook: useWorkingHours
 *
 * Fetches and manages a barber's working hours schedule.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { WorkingHours, DayOfWeek } from '@/types';

interface UseWorkingHoursReturn {
  workingHours: WorkingHours[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getForDay: (day: DayOfWeek) => WorkingHours | undefined;
  update: (id: string, changes: Partial<WorkingHours>) => Promise<{ error: string | null }>;
}

export function useWorkingHours(barberId: string | null): UseWorkingHoursReturn {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!barberId) {
      setWorkingHours([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('working_hours')
        .select('*')
        .eq('barber_id', barberId)
        .order('day_of_week', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setWorkingHours((data as WorkingHours[]) ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [barberId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const getForDay = useCallback(
    (day: DayOfWeek): WorkingHours | undefined => {
      return workingHours.find((wh) => wh.day_of_week === day);
    },
    [workingHours],
  );

  const update = useCallback(
    async (id: string, changes: Partial<WorkingHours>): Promise<{ error: string | null }> => {
      const { error: updateError } = await supabase
        .from('working_hours')
        .update(changes)
        .eq('id', id);

      if (updateError) {
        return { error: updateError.message };
      }

      await fetch();
      return { error: null };
    },
    [fetch],
  );

  return { workingHours, loading, error, refresh: fetch, getForDay, update };
}
