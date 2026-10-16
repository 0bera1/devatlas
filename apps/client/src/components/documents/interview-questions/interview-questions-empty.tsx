'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export function InterviewQuestionsEmpty(): ReactNode {
  const { t } = useTranslations();
  return (
    <p className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-6 text-center text-xs text-[var(--muted)]">
      {t('documents.interviewQuestions.empty')}
    </p>
  );
}
