'use client';

import { InterviewCategoryFilter } from '@/components/knowledge/interview/interview-category-filter';
import { InterviewDifficultyFilter } from '@/components/knowledge/interview/interview-difficulty-filter';
import { InterviewQuestionList } from '@/components/knowledge/interview/interview-question-list';
import { KnowledgeInfiniteScrollFooter } from '@/components/knowledge/knowledge-infinite-scroll-footer';
import type { InterviewPrepCategorySummary } from '@/domains/knowledge/knowledgeDomains';
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

/** Mülakat hazırlığı: solda konu ve zorluk filtreleri, sağda soru tablosu. */
export function KnowledgeInterviewPanel({ searchQuery }: KnowledgeInterviewPanelProps): ReactNode {
  const { t } = useTranslations();
  const { category: selectedCategory, setCategory: setSelectedCategory } = useInterviewPrepCategory();
  const { difficulty: selectedDifficulty, setDifficulty: setSelectedDifficulty } = useInterviewPrepDifficulty();

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
  } = useInterviewPrepQuestionsInfiniteQuery(selectedCategory, selectedDifficulty, searchQuery);

  const errorMessage = useMemo((): string | null => {
    const err: Error | null = categoriesErrorRaw ?? questionsErrorRaw ?? null;
    if ((!categoriesError && !questionsError) || err === null) {
      return null;
    }
    return isHttpNetworkError(err) ? t('errors.network') : err.message;
  }, [categoriesError, categoriesErrorRaw, questionsError, questionsErrorRaw, t]);

  const categorySummaries: readonly InterviewPrepCategorySummary[] = categories ?? [];
  const questions = useMemo(() => flattenKnowledgeInfiniteData(questionsData), [questionsData]);

  const handleFetchNextPage = useCallback((): void => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const { sentinelRef } = useKnowledgeInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage: handleFetchNextPage,
  });

  if (errorMessage !== null) {
    return <p className="rounded-xl border border-red-300/60 px-4 py-3 text-sm text-red-700 dark:text-red-300">{errorMessage}</p>;
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
      <aside className="flex flex-col gap-8">
        {categoriesPending ? (
          <div className="animate-pulse space-y-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="h-8 rounded-lg bg-[var(--border)]" />
            ))}
          </div>
        ) : (
          <InterviewCategoryFilter categories={categorySummaries} selected={selectedCategory} onChange={setSelectedCategory} />
        )}
        <InterviewDifficultyFilter selected={selectedDifficulty} onChange={setSelectedDifficulty} />
        <p className="text-xs leading-relaxed text-[var(--muted)]">{t('knowledge.interview.intro')}</p>
      </aside>

      <div className="min-w-0">
        {questionsPending ? (
          <div className="animate-pulse space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="h-14 rounded bg-[var(--border)]" />
            ))}
          </div>
        ) : (
          <InterviewQuestionList
            questions={questions}
            emptyMessage={searchQuery.length > 0 ? t('knowledge.search.noResults') : t('knowledge.interview.empty')}
            footer={
              <KnowledgeInfiniteScrollFooter
                sentinelRef={sentinelRef}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage ?? false}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
