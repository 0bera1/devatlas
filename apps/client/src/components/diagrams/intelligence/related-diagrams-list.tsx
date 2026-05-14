'use client';

import { RelatedDiagramCard } from '@/components/diagrams/intelligence/related-diagram-card';
import { ResourceGroup } from '@/components/diagrams/intelligence/resource-group';
import type { ScoredDiagramRecommendation } from '@/domains/intelligence/intelligenceDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export interface RelatedDiagramsListProps {
  readonly items: readonly ScoredDiagramRecommendation[];
}

export function RelatedDiagramsList(
  props: RelatedDiagramsListProps,
): ReactNode {
  const { items } = props;
  const { t } = useTranslations();

  return (
    <ResourceGroup
      title={t('diagrams.related.diagramsTitle')}
      count={items.length}
    >
      {items.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t('diagrams.related.diagramsEmpty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item: ScoredDiagramRecommendation) => (
            <li key={item.id}>
              <RelatedDiagramCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </ResourceGroup>
  );
}
