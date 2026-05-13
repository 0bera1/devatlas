'use client';

import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';

export function InterviewQuestionsHeader(): ReactNode {
  const { t } = useTranslations();
  return (
    <header className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {t('documents.interviewQuestions.title')}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {t('documents.interviewQuestions.subtitle')}
      </p>
    </header>
  );
}
