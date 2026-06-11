'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { KnowledgeInfiniteScrollFooter } from '@/components/knowledge/knowledge-infinite-scroll-footer';
import { buildKnowledgeNarrativeExcerpt } from '@/components/knowledge/knowledge-narrative-excerpt';
import type { KnowledgeFlowSummary } from '@/domains/knowledge/knowledgeDomains';
import { useKnowledgeFlowsInfiniteQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useKnowledgeInfiniteScroll } from '@/hooks/knowledge/use-knowledge-infinite-scroll';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { flattenKnowledgeInfiniteData } from '@/lib/knowledge/flatten-knowledge-pages';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

export function KnowledgeFlowsPanel(): ReactNode {
  const { t } = useTranslations();
  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useKnowledgeFlowsInfiniteQuery();

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const flows: readonly KnowledgeFlowSummary[] = useMemo(
    () => flattenKnowledgeInfiniteData(data),
    [data],
  );

  const handleFetchNextPage = useCallback((): void => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const { sentinelRef } = useKnowledgeInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage: handleFetchNextPage,
  });

  if (isPending) {
    return (
      <div className="animate-pulse space-y-3">
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

  if (flows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        {t('knowledge.flows.empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {flows.map((flow: KnowledgeFlowSummary) => {
        const excerpt: string | null = buildKnowledgeNarrativeExcerpt(flow.narrative);
        return (
          <li key={flow.id}>
            <Link
              href={`/knowledge/flows/${flow.slug}`}
              className="block rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {flow.title}
                </h3>
                {excerpt !== null ? (
                  <span className="shrink-0 rounded-full bg-indigo-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100">
                    {t('knowledge.narrative.badge')}
                  </span>
                ) : null}
              </div>
              {flow.description !== null && flow.description.length > 0 ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {flow.description}
                </p>
              ) : null}
              {excerpt !== null ? (
                <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {excerpt}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">
                {flow.stepCount} {t('knowledge.flows.stepsLabel')}
              </p>
            </Link>
          </li>
        );
      })}
      <li>
        <KnowledgeInfiniteScrollFooter
          sentinelRef={sentinelRef}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
        />
      </li>
    </ul>
  );
}
