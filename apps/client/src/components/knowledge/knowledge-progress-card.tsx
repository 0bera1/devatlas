'use client';

import { studyApi, type StudyProgress } from '@/api/study/studyApi';
import { useAuth } from '@/components/providers/auth-provider';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Bilgi tabanı başlığının sağındaki ilerleme kutusu. Giriş yapılmışsa öğrenilen sorular ve oran gösterilir;
 * değilse giriş ipucu verilir.
 */
export function KnowledgeProgressCard(): ReactNode {
  const { t } = useTranslations();
  const { token, isReady } = useAuth();

  const progressQuery = useQuery({
    queryKey: ['knowledge', 'progress', token],
    queryFn: async (): Promise<StudyProgress> => studyApi.progress(token as string),
    enabled: isReady && token !== null,
    staleTime: 60_000,
  });

  if (!isReady) {
    return null;
  }

  if (token === null || !progressQuery.data) {
    return (
      <div className="flex flex-col gap-2 border-t border-[var(--foreground)] pt-4 md:border-0 md:pt-0">
        {token === null ? (
          <p className="text-sm text-[var(--muted)]">
            {t('knowledge.progress.loginHint')}{' '}
            <Link href="/login" className="font-medium text-[var(--foreground)] underline underline-offset-4">
              {t('nav.login')}
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  const { learned, totalQuestions } = progressQuery.data;
  const percent: number = totalQuestions === 0 ? 0 : Math.round((learned / totalQuestions) * 100);

  return (
    <div className="flex flex-col gap-2.5 border-t border-[var(--foreground)] pt-4 md:border-0 md:pt-0">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-[var(--muted)]">{t('knowledge.progress.completed')}</span>
        <span className="font-semibold tabular-nums">
          {learned} / {totalQuestions}
        </span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]"
        role="progressbar"
        aria-label={t('knowledge.progress.completed')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="h-full rounded-full bg-[var(--foreground)]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
