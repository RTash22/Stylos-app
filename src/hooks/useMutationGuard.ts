/**
 * Hook: useMutationGuard
 *
 * Prevents double-tap by tracking loading state for mutations.
 */
import { useState, useCallback, useRef } from 'react';

export function useMutationGuard() {
  const [isMutating, setIsMutating] = useState(false);
  const lockRef = useRef(false);

  const guard = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      if (lockRef.current) return null;
      lockRef.current = true;
      setIsMutating(true);

      try {
        return await fn();
      } finally {
        lockRef.current = false;
        setIsMutating(false);
      }
    },
    [],
  );

  return { isMutating, guard };
}
