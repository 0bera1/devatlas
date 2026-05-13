'use client';

import { ScoreBadge } from '@/components/diagrams/intelligence/score-badge';
import type { SimilarTechnologyRecommendation } from '@/domains/intelligenceDomains';
import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';

export interface SimilarTechnologyCardProps {
  readonly item: SimilarTechnologyRecommendation;
}

export function SimilarTechnologyCard(
  props: SimilarTechnologyCardProps,
): ReactNode {
  const { item } = props;
  const { t } = useTranslations();

  return (
    <div className="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-zinc-950 dark:text-zinc-50">
          {item.label}
        </span>
        <ScoreBadge label={t('diagrams.related.score')} score={item.score} />
      </div>
      <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
        {t('diagrams.related.relatedDiagramCount')}:{' '}
        <span className="tabular-nums">{item.relatedDiagramCount}</span>
      </span>
    </div>
  );
}
