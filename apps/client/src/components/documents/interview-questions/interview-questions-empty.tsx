'use client';

import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';

export function InterviewQuestionsEmpty(): ReactNode {
  const { t } = useTranslations();
  return (
    <p className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      {t('documents.interviewQuestions.empty')}
    </p>
  );
}
