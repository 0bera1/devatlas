'use client';

import { useTranslations } from '@/hooks/use-translations';
import { useCallback } from 'react';

export function useFormatDocumentDate(): (iso: string) => string {
  const { locale } = useTranslations();

  return useCallback(
    (iso: string): string => {
      try {
        return new Date(iso).toLocaleString(
          locale === 'tr' ? 'tr-TR' : 'en-US',
          {
            dateStyle: 'medium',
            timeStyle: 'short',
          },
        );
      } catch {
        return iso;
      }
    },
    [locale],
  );
}
