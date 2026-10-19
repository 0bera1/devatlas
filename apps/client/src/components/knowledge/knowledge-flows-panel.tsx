'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { KnowledgeInfiniteScrollFooter } from '@/components/knowledge/knowledge-infinite-scroll-footer';
import { buildKnowledgeNarrativeExcerpt } from '@/components/knowledge/knowledge-narrative-excerpt';
import { KnowledgeRowList, type KnowledgeRow } from '@/components/knowledge/knowledge-row-list';
import type { KnowledgeFlowSummary } from '@/domains/knowledge/knowledgeDomains';
import { useKnowledgeFlowsInfiniteQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useKnowledgeInfiniteScroll } from '@/hooks/knowledge/use-knowledge-infinite-scroll';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { flattenKnowledgeInfiniteData } from '@/lib/knowledge/flatten-knowledge-pages';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

interface KnowledgeFlowsPanelProps {
  readonly searchQuery: string;
}

export function KnowledgeFlowsPanel({ searchQuery }: KnowledgeFlowsPanelProps): ReactNode {
  const { t } = useTranslations();
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useKnowledgeFlowsInfiniteQuery(searchQuery);

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const rows: readonly KnowledgeRow[] = useMemo(
    () =>
      flattenKnowledgeInfiniteData(data).map((flow: KnowledgeFlowSummary): KnowledgeRow => {
        const excerpt: string | null = buildKnowledgeNarrativeExcerpt(flow.narrative);
        return {
          key: flow.id,
          href: `/knowledge/flows/${flow.slug}`,
          title: flow.title,
          description: flow.description !== null && flow.description.length > 0 ? flow.description : excerpt,
          meta: `${flow.stepCount} ${t('knowledge.flows.stepsLabel')}`,
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
      emptyMessage={searchQuery.length > 0 ? t('knowledge.search.noResults') : t('knowledge.flows.empty')}
      footer={<KnowledgeInfiniteScrollFooter sentinelRef={sentinelRef} isFetchingNextPage={isFetchingNextPage} hasNextPage={hasNextPage ?? false} />}
    />
  );
}
