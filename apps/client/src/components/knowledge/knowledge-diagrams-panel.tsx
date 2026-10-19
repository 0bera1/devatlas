'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { KnowledgeInfiniteScrollFooter } from '@/components/knowledge/knowledge-infinite-scroll-footer';
import { buildKnowledgeNarrativeExcerpt } from '@/components/knowledge/knowledge-narrative-excerpt';
import { KnowledgeRowList, type KnowledgeRow } from '@/components/knowledge/knowledge-row-list';
import type { KnowledgeDiagramSummary } from '@/domains/knowledge/knowledgeDomains';
import { useKnowledgeDiagramsInfiniteQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useKnowledgeInfiniteScroll } from '@/hooks/knowledge/use-knowledge-infinite-scroll';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { flattenKnowledgeInfiniteData } from '@/lib/knowledge/flatten-knowledge-pages';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

interface KnowledgeDiagramsPanelProps {
  readonly searchQuery: string;
}

export function KnowledgeDiagramsPanel({ searchQuery }: KnowledgeDiagramsPanelProps): ReactNode {
  const { t } = useTranslations();
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useKnowledgeDiagramsInfiniteQuery(searchQuery);

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const rows: readonly KnowledgeRow[] = useMemo(
    () =>
      flattenKnowledgeInfiniteData(data).map((row: KnowledgeDiagramSummary): KnowledgeRow => {
        const excerpt: string | null = buildKnowledgeNarrativeExcerpt(row.narrative);
        return {
          key: row.id,
          href: `/knowledge/diagrams/${row.slug}`,
          title: row.title,
          description: row.description !== null && row.description.length > 0 ? row.description : excerpt,
          meta: `${row.nodeCount} ${t('knowledge.diagrams.nodesLabel')}`,
          badge: excerpt !== null ? t('knowledge.narrative.badge') : null,
        };
      }),
    [data, t],
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
      emptyMessage={searchQuery.length > 0 ? t('knowledge.search.noResults') : t('knowledge.diagrams.empty')}
      footer={<KnowledgeInfiniteScrollFooter sentinelRef={sentinelRef} isFetchingNextPage={isFetchingNextPage} hasNextPage={hasNextPage ?? false} />}
    />
  );
}
