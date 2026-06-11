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

export function KnowledgeInterviewDetailView({
  slug,
}: KnowledgeInterviewDetailViewProps): ReactNode {
  const { t } = useTranslations();
  const categoryLabel = useInterviewPrepCategoryLabel();
  const [answerVisible, setAnswerVisible] = useState<boolean>(false);
  const { data, isPending, isError, error } = useInterviewPrepQuestionQuery(
    slug,
    true,
  );

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
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 w-3/4 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-40 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (errorMessage !== null || data === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-red-700 dark:text-red-300">
          {errorMessage ?? t('knowledge.interview.notFound')}
        </p>
        <KnowledgeBackLink className="text-sm font-medium text-zinc-800 underline dark:text-zinc-200" />
      </div>
    );
  }

  const hasFollowUps: boolean = data.followUps.length > 0;
  const hasRelatedResources: boolean =
    data.documents.length > 0 ||
    data.diagrams.length > 0 ||
    data.flows.length > 0;

  return (
    <div className="flex flex-col gap-12">
      <div
        className={
          hasFollowUps
            ? 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,22rem)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_24rem]'
            : 'flex flex-col'
        }
      >
        <article className="flex min-w-0 flex-col gap-6">
          <header className="flex flex-col gap-4">
            <KnowledgeBackLink />
            <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white via-white to-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900/80">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {categoryLabel(data.category)}
                </span>
                <InterviewDifficultyBadge difficulty={data.difficulty} />
              </div>
              <h1 className="text-xl font-semibold leading-snug tracking-tight text-zinc-950 sm:text-2xl dark:text-zinc-50">
                {data.question}
              </h1>
            </div>
          </header>

          <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800/80">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t('knowledge.interview.modelAnswer')}
              </h2>
              <button
                type="button"
                onClick={(): void => setAnswerVisible((prev) => !prev)}
                className="shrink-0 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {answerVisible
                  ? t('knowledge.interview.hideAnswer')
                  : t('knowledge.interview.showAnswer')}
              </button>
            </div>
            <SmoothCollapse open={!answerVisible}>
              <p className="px-5 py-5 text-sm text-zinc-500 dark:text-zinc-400">
                {t('knowledge.interview.answerHiddenHint')}
              </p>
            </SmoothCollapse>
            <SmoothCollapse open={answerVisible}>
              <p className="whitespace-pre-wrap px-5 py-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {data.answer}
              </p>
            </SmoothCollapse>
          </section>
        </article>

        {hasFollowUps ? (
          <InterviewFollowUpsSidebar followUps={data.followUps} />
        ) : null}
      </div>

      {hasRelatedResources ? (
        <InterviewRelatedResources
          resources={{
            documents: data.documents,
            diagrams: data.diagrams,
            flows: data.flows,
          }}
        />
      ) : null}
    </div>
  );
}
