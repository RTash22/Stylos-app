/**
 * Hook: useAestheticNotes
 *
 * CRUD operations for aesthetic notes on a client or appointment.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AestheticNote } from '@/types';

interface UseAestheticNotesOptions {
  clientId?: string | null;
  appointmentId?: string | null;
  enabled?: boolean;
}

interface UseAestheticNotesReturn {
  notes: AestheticNote[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createNote: (note: Omit<AestheticNote, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: AestheticNote | null; error: string | null }>;
  updateNote: (id: string, updates: Partial<Pick<AestheticNote, 'procedure' | 'products_used' | 'observations' | 'recommendations'>>) => Promise<{ error: string | null }>;
  deleteNote: (id: string) => Promise<{ error: string | null }>;
}

export function useAestheticNotes({
  clientId = null,
  appointmentId = null,
  enabled = true,
}: UseAestheticNotesOptions = {}): UseAestheticNotesReturn {
  const [notes, setNotes] = useState<AestheticNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled || (!clientId && !appointmentId)) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('aesthetic_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) query = query.eq('client_id', clientId);
      if (appointmentId) query = query.eq('appointment_id', appointmentId);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setNotes([]);
      } else {
        setNotes((data as AestheticNote[]) ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [clientId, appointmentId, enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  const createNote = useCallback(async (
    note: Omit<AestheticNote, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<{ data: AestheticNote | null; error: string | null }> => {
    const { data, error: insertError } = await supabase
      .from('aesthetic_notes')
      .insert(note)
      .select()
      .single();

    if (insertError) return { data: null, error: insertError.message };

    await fetch();
    return { data: data as AestheticNote, error: null };
  }, [fetch]);

  const updateNote = useCallback(async (
    id: string,
    updates: Partial<Pick<AestheticNote, 'procedure' | 'products_used' | 'observations' | 'recommendations'>>,
  ): Promise<{ error: string | null }> => {
    const { error: updateError } = await supabase
      .from('aesthetic_notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) return { error: updateError.message };
    await fetch();
    return { error: null };
  }, [fetch]);

  const deleteNote = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const { error: deleteError } = await supabase
      .from('aesthetic_notes')
      .delete()
      .eq('id', id);

    if (deleteError) return { error: deleteError.message };
    await fetch();
    return { error: null };
  }, [fetch]);

  return { notes, loading, error, refresh: fetch, createNote, updateNote, deleteNote };
}
