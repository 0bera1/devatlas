'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export function DocumentsListSkeleton(): ReactNode {
  const { t } = useTranslations();

  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-busy="true"
      aria-label={t('documents.list.skeleton')}
    >
      {Array.from({ length: 6 }).map((_, index: number) => (
        <div
          key={index}
          className="h-[4.5rem] w-full animate-pulse rounded-2xl bg-zinc-200/90 dark:bg-zinc-800/80"
        />
      ))}
    </div>
  );
}
