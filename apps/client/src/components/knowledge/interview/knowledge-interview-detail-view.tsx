'use client';

import { InterviewDifficultyBadge } from '@/components/knowledge/interview/interview-difficulty-badge';
import { InterviewFollowUpsSidebar } from '@/components/knowledge/interview/interview-follow-ups-sidebar';
import { InterviewRelatedResources } from '@/components/knowledge/interview/interview-related-resources';
import { SmoothCollapse } from '@/components/knowledge/interview/smooth-collapse';
import { KnowledgeBackLink } from '@/components/knowledge/knowledge-back-link';
import { isHttpNetworkError, isNotFoundHttpError } from '@/api/http/execute-request';
import { useInterviewPrepQuestionQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useInterviewPrepCategoryLabel } from '@/hooks/knowledge/use-interview-prep-category-label';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

interface KnowledgeInterviewDetailViewProps {
  readonly slug: string;
}

/** Mülakat sorusu: büyük serif soru, gizlenebilir model cevap, sağda takip soruları, altta kaynaklar. */
export function KnowledgeInterviewDetailView({ slug }: KnowledgeInterviewDetailViewProps): ReactNode {
  const { t } = useTranslations();
  const categoryLabel = useInterviewPrepCategoryLabel();
  const [answerVisible, setAnswerVisible] = useState<boolean>(false);
  const { data, isPending, isError, error } = useInterviewPrepQuestionQuery(slug, true);

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    if (isNotFoundHttpError(error)) {
      return t('knowledge.interview.notFound');
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  if (isPending) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-40 rounded bg-[var(--border)]" />
        <div className="h-12 w-3/4 rounded bg-[var(--border)]" />
        <div className="h-40 rounded bg-[var(--border)]" />
      </div>
    );
  }

  if (errorMessage !== null || data === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-red-700 dark:text-red-300">{errorMessage ?? t('knowledge.interview.notFound')}</p>
        <KnowledgeBackLink className="text-sm font-medium text-[var(--foreground)] underline" />
      </div>
    );
  }

  const hasFollowUps: boolean = data.followUps.length > 0;
  const hasRelatedResources: boolean = data.documents.length > 0 || data.diagrams.length > 0 || data.flows.length > 0;

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--muted)]">
        <span className="flex min-w-0 items-center gap-2">
          <KnowledgeBackLink className="text-[var(--muted)] hover:text-[var(--foreground)]" />
          <span aria-hidden>/</span>
          <span className="truncate text-[var(--foreground)]">{t('knowledge.section.interview')}</span>
        </span>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">{t('knowledge.readOnly')}</span>
      </div>

      <div className={hasFollowUps ? 'grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_340px]' : 'mx-auto w-full max-w-3xl'}>
        <article className="flex min-w-0 flex-col">
          <p className="flex flex-wrap items-baseline gap-x-2 text-[13px] text-[var(--muted)]">
            <span>{categoryLabel(data.category)}</span>
            {data.difficulty !== null ? (
              <>
                <span aria-hidden>·</span>
                <InterviewDifficultyBadge difficulty={data.difficulty} />
              </>
            ) : null}
          </p>
          <h1 className="mt-3.5 font-serif text-3xl font-medium leading-tight tracking-tight sm:text-[44px] sm:leading-[1.1]">{data.question}</h1>

          <section className="mt-10 border-t border-[var(--border)] pt-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{t('knowledge.interview.modelAnswer')}</h2>
              <button
                type="button"
                aria-expanded={answerVisible}
                onClick={(): void => setAnswerVisible((prev) => !prev)}
                className="shrink-0 rounded-full bg-[var(--foreground)] px-4 py-1.5 text-xs font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
              >
                {answerVisible ? t('knowledge.interview.hideAnswer') : t('knowledge.interview.showAnswer')}
              </button>
            </div>
            <SmoothCollapse open={!answerVisible}>
              <p className="py-5 text-sm text-[var(--muted)]">{t('knowledge.interview.answerHiddenHint')}</p>
            </SmoothCollapse>
            <SmoothCollapse open={answerVisible}>
              <p className="whitespace-pre-wrap py-5 font-serif text-[19px] leading-[1.65] text-[var(--foreground)]">{data.answer}</p>
            </SmoothCollapse>
          </section>
        </article>

        {hasFollowUps ? <InterviewFollowUpsSidebar followUps={data.followUps} /> : null}
      </div>

      {hasRelatedResources ? (
        <InterviewRelatedResources resources={{ documents: data.documents, diagrams: data.diagrams, flows: data.flows }} />
      ) : null}
    </div>
  );
}
