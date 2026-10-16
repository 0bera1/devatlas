'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { KnowledgeInfiniteScrollFooter } from '@/components/knowledge/knowledge-infinite-scroll-footer';
import { buildKnowledgeNarrativeExcerpt } from '@/components/knowledge/knowledge-narrative-excerpt';
import type { KnowledgeDiagramSummary } from '@/domains/knowledge/knowledgeDomains';
import { useKnowledgeDiagramsInfiniteQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useKnowledgeInfiniteScroll } from '@/hooks/knowledge/use-knowledge-infinite-scroll';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { flattenKnowledgeInfiniteData } from '@/lib/knowledge/flatten-knowledge-pages';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

interface KnowledgeDiagramsPanelProps {
  readonly searchQuery: string;
}

export function KnowledgeDiagramsPanel({
  searchQuery,
}: KnowledgeDiagramsPanelProps): ReactNode {
  const { t } = useTranslations();
  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useKnowledgeDiagramsInfiniteQuery(searchQuery);

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const diagrams: readonly KnowledgeDiagramSummary[] = useMemo(
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
        <div className="h-20 rounded-2xl bg-[var(--border)]" />
        <div className="h-20 rounded-2xl bg-[var(--border)]" />
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

  if (diagrams.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-10 text-center text-sm text-[var(--muted)]">
        {searchQuery.length > 0
          ? t('knowledge.search.noResults')
          : t('knowledge.diagrams.empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {diagrams.map((row: KnowledgeDiagramSummary) => {
        const excerpt: string | null = buildKnowledgeNarrativeExcerpt(row.narrative);
        return (
          <li key={row.id}>
            <Link
              href={`/knowledge/diagrams/${row.slug}`}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  {row.title}
                </h3>
                {excerpt !== null ? (
                  <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                    {t('knowledge.narrative.badge')}
                  </span>
                ) : null}
              </div>
              {row.description !== null && row.description.length > 0 ? (
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {row.description}
                </p>
              ) : null}
              {excerpt !== null ? (
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                  {excerpt}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-[var(--muted)]">
                {row.nodeCount} {t('knowledge.diagrams.nodesLabel')}
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
