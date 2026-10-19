'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { KnowledgeInfiniteScrollFooter } from '@/components/knowledge/knowledge-infinite-scroll-footer';
import { KnowledgeRowList, type KnowledgeRow } from '@/components/knowledge/knowledge-row-list';
import type { KnowledgeDocumentSummary } from '@/domains/knowledge/knowledgeDomains';
import { useKnowledgeDocumentsInfiniteQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useKnowledgeInfiniteScroll } from '@/hooks/knowledge/use-knowledge-infinite-scroll';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { flattenKnowledgeInfiniteData } from '@/lib/knowledge/flatten-knowledge-pages';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

interface KnowledgeDocumentsPanelProps {
  readonly searchQuery: string;
}

export function KnowledgeDocumentsPanel({ searchQuery }: KnowledgeDocumentsPanelProps): ReactNode {
  const { t } = useTranslations();
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useKnowledgeDocumentsInfiniteQuery(searchQuery);

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const rows: readonly KnowledgeRow[] = useMemo(
    () =>
      flattenKnowledgeInfiniteData(data).map((doc: KnowledgeDocumentSummary): KnowledgeRow => ({
        key: doc.id,
        href: `/knowledge/documents/${doc.slug}`,
        title: doc.title,
        description: doc.summary,
        meta: null,
        badge: null,
      })),
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

  return (
    <KnowledgeRowList
      rows={rows}
      isPending={isPending}
      errorMessage={errorMessage}
      emptyMessage={searchQuery.length > 0 ? t('knowledge.search.noResults') : t('knowledge.documents.empty')}
      footer={<KnowledgeInfiniteScrollFooter sentinelRef={sentinelRef} isFetchingNextPage={isFetchingNextPage} hasNextPage={hasNextPage ?? false} />}
    />
  );
}
