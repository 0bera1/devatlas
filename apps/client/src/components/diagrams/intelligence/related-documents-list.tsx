'use client';

import { RelatedDocumentCard } from '@/components/diagrams/intelligence/related-document-card';
import { ResourceGroup } from '@/components/diagrams/intelligence/resource-group';
import type { ScoredDocumentRecommendation } from '@/domains/intelligence/intelligenceDomains';
import type { ReactNode } from 'react';

export interface RelatedDocumentsListProps {
  readonly title: string;
  readonly emptyLabel: string;
  readonly items: readonly ScoredDocumentRecommendation[];
}

export function RelatedDocumentsList(
  props: RelatedDocumentsListProps,
): ReactNode {
  const { title, emptyLabel, items } = props;

  return (
    <ResourceGroup title={title} count={items.length}>
      {items.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item: ScoredDocumentRecommendation) => (
            <li key={item.id}>
              <RelatedDocumentCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </ResourceGroup>
  );
}
