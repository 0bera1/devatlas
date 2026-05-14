'use client';

import { useEffect, useState } from 'react';

/**
 * Değer değişiminden `delayMs` sonra güncellenen debounced kopya (ör. arama API).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timerId: ReturnType<typeof setTimeout> = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      clearTimeout(timerId);
    };
  }, [value, delayMs]);

  return debounced;
}
