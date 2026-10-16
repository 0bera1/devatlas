'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { KnowledgeInfiniteScrollFooter } from '@/components/knowledge/knowledge-infinite-scroll-footer';
import type { KnowledgeDocumentSummary } from '@/domains/knowledge/knowledgeDomains';
import { useKnowledgeDocumentsInfiniteQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useKnowledgeInfiniteScroll } from '@/hooks/knowledge/use-knowledge-infinite-scroll';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { flattenKnowledgeInfiniteData } from '@/lib/knowledge/flatten-knowledge-pages';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

interface KnowledgeDocumentsPanelProps {
  readonly searchQuery: string;
}

export function KnowledgeDocumentsPanel({
  searchQuery,
}: KnowledgeDocumentsPanelProps): ReactNode {
  const { t } = useTranslations();
  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useKnowledgeDocumentsInfiniteQuery(searchQuery);

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const items: readonly KnowledgeDocumentSummary[] = useMemo(
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

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-10 text-center text-sm text-[var(--muted)]">
        {searchQuery.length > 0
          ? t('knowledge.search.noResults')
          : t('knowledge.documents.empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((doc: KnowledgeDocumentSummary) => (
        <li key={doc.id}>
          <Link
            href={`/knowledge/documents/${doc.slug}`}
            className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)]"
          >
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {doc.title}
            </h2>
            {doc.summary !== null && doc.summary.length > 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {doc.summary}
              </p>
            ) : null}
            <span className="mt-3 inline-block text-xs font-medium text-[var(--muted)]">
              {t('knowledge.readOnly')}
            </span>
          </Link>
        </li>
      ))}
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
