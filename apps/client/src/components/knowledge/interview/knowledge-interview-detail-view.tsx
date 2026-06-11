'use client';

import { InterviewFollowUpsSidebar } from '@/components/knowledge/interview/interview-follow-ups-sidebar';
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
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/3 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-48 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
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

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <KnowledgeBackLink />
          <span className="inline-flex w-fit rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {categoryLabel(data.category)}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {data.question}
          </h1>
        </header>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
          <button
            type="button"
            onClick={(): void => setAnswerVisible((prev) => !prev)}
            className="text-sm font-medium text-zinc-800 underline dark:text-zinc-200"
          >
            {answerVisible
              ? t('knowledge.interview.hideAnswer')
              : t('knowledge.interview.showAnswer')}
          </button>
          {answerVisible ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
              {data.answer}
            </p>
          ) : null}
        </div>
      </article>
      {data.followUps.length > 0 ? (
        <InterviewFollowUpsSidebar followUps={data.followUps} />
      ) : null}
    </div>
  );
}
