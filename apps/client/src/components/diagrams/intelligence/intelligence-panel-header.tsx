'use client';

import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';

export function IntelligencePanelHeader(): ReactNode {
  const { t } = useTranslations();
  return (
    <header>
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {t('diagrams.related.title')}
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {t('diagrams.related.subtitle')}
      </p>
    </header>
  );
}
