'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export function KnowledgeInterviewPlaceholder(): ReactNode {
  const { t } = useTranslations();

  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 px-8 py-16 text-center dark:border-zinc-700">
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {t('knowledge.interview.comingSoonTitle')}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {t('knowledge.interview.comingSoonBody')}
      </p>
    </div>
  );
}
