'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export function InterviewQuestionsHeader(): ReactNode {
  const { t } = useTranslations();
  return (
    <header className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">
        {t('documents.interviewQuestions.title')}
      </h3>
      <p className="text-xs text-[var(--muted)]">
        {t('documents.interviewQuestions.subtitle')}
      </p>
    </header>
  );
}
