'use client';

import { InterviewCategoryFilter } from '@/components/knowledge/interview/interview-category-filter';
import { InterviewQuestionList } from '@/components/knowledge/interview/interview-question-list';
import type { InterviewPrepCategory } from '@/domains/knowledge/knowledgeDomains';
import {
  useInterviewPrepCategoriesQuery,
  useInterviewPrepQuestionsQuery,
} from '@/features/knowledge/queries/useKnowledgeQueries';
import { isHttpNetworkError } from '@/api/http/execute-request';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

export function KnowledgeInterviewPanel(): ReactNode {
  const { t } = useTranslations();
  const [selectedCategory, setSelectedCategory] =
    useState<InterviewPrepCategory | null>(null);

  const {
    data: categories,
    isPending: categoriesPending,
    isError: categoriesError,
    error: categoriesErrorRaw,
  } = useInterviewPrepCategoriesQuery();

  const {
    data: questions,
    isPending: questionsPending,
    isError: questionsError,
    error: questionsErrorRaw,
  } = useInterviewPrepQuestionsQuery(selectedCategory);

  const errorMessage = useMemo((): string | null => {
    const err: Error | null =
      categoriesErrorRaw ?? questionsErrorRaw ?? null;
    if ((!categoriesError && !questionsError) || err === null) {
      return null;
    }
    return isHttpNetworkError(err) ? t('errors.network') : err.message;
  }, [categoriesError, categoriesErrorRaw, questionsError, questionsErrorRaw, t]);

  const categoryOptions = useMemo((): InterviewPrepCategory[] => {
    if (categories === undefined) {
      return [];
    }
    return categories.map((entry) => entry.category);
  }, [categories]);

  const isPending: boolean = categoriesPending || questionsPending;

  if (isPending) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-full max-w-md rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-20 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-20 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (errorMessage !== null) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
        {errorMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {t('knowledge.interview.intro')}
      </p>
      <InterviewCategoryFilter
        categories={categoryOptions}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      <InterviewQuestionList questions={questions ?? []} />
    </div>
  );
}
