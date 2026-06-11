'use client';

import { InterviewCategoryFilter } from '@/components/knowledge/interview/interview-category-filter';
import { InterviewDifficultyFilter } from '@/components/knowledge/interview/interview-difficulty-filter';
import { InterviewQuestionList } from '@/components/knowledge/interview/interview-question-list';
import { KnowledgeInfiniteScrollFooter } from '@/components/knowledge/knowledge-infinite-scroll-footer';
import type { InterviewPrepCategory } from '@/domains/knowledge/knowledgeDomains';
import {
  useInterviewPrepCategoriesQuery,
  useInterviewPrepQuestionsInfiniteQuery,
} from '@/features/knowledge/queries/useKnowledgeQueries';
import { isHttpNetworkError } from '@/api/http/execute-request';
import { useInterviewPrepCategory } from '@/hooks/knowledge/use-interview-prep-category';
import { useInterviewPrepDifficulty } from '@/hooks/knowledge/use-interview-prep-difficulty';
import { useKnowledgeInfiniteScroll } from '@/hooks/knowledge/use-knowledge-infinite-scroll';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { flattenKnowledgeInfiniteData } from '@/lib/knowledge/flatten-knowledge-pages';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

interface KnowledgeInterviewPanelProps {
  readonly searchQuery: string;
}

export function KnowledgeInterviewPanel({
  searchQuery,
}: KnowledgeInterviewPanelProps): ReactNode {
  const { t } = useTranslations();
  const { category: selectedCategory, setCategory: setSelectedCategory } =
    useInterviewPrepCategory();
  const { difficulty: selectedDifficulty, setDifficulty: setSelectedDifficulty } =
    useInterviewPrepDifficulty();

  const {
    data: categories,
    isPending: categoriesPending,
    isError: categoriesError,
    error: categoriesErrorRaw,
  } = useInterviewPrepCategoriesQuery();

  const {
    data: questionsData,
    isPending: questionsPending,
    isError: questionsError,
    error: questionsErrorRaw,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInterviewPrepQuestionsInfiniteQuery(
    selectedCategory,
    selectedDifficulty,
    searchQuery,
  );

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

  const questions = useMemo(
    () => flattenKnowledgeInfiniteData(questionsData),
    [questionsData],
  );

  const handleFetchNextPage = useCallback((): void => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const { sentinelRef } = useKnowledgeInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage: handleFetchNextPage,
  });

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
      <InterviewDifficultyFilter
        selected={selectedDifficulty}
        onChange={setSelectedDifficulty}
      />
      <InterviewQuestionList
        questions={questions}
        emptyMessage={
          searchQuery.length > 0
            ? t('knowledge.search.noResults')
            : t('knowledge.interview.empty')
        }
        footer={
          <KnowledgeInfiniteScrollFooter
            sentinelRef={sentinelRef}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage ?? false}
          />
        }
      />
    </div>
  );
}
