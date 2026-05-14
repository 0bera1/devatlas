'use client';

import { ResourceGroup } from '@/components/diagrams/intelligence/resource-group';
import { SimilarTechnologyCard } from '@/components/diagrams/intelligence/similar-technology-card';
import type { SimilarTechnologyRecommendation } from '@/domains/intelligence/intelligenceDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export interface SimilarTechnologiesListProps {
  readonly items: readonly SimilarTechnologyRecommendation[];
}

export function SimilarTechnologiesList(
  props: SimilarTechnologiesListProps,
): ReactNode {
  const { items } = props;
  const { t } = useTranslations();

  return (
    <ResourceGroup
      title={t('diagrams.related.technologiesTitle')}
      count={items.length}
    >
      {items.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t('diagrams.related.technologiesEmpty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item: SimilarTechnologyRecommendation) => (
            <li key={item.label}>
              <SimilarTechnologyCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </ResourceGroup>
  );
}
