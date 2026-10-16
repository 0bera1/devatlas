'use client';

import { ScoreBadge } from '@/components/diagrams/intelligence/score-badge';
import type { SimilarTechnologyRecommendation } from '@/domains/intelligence/intelligenceDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
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
    <div className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-[var(--foreground)]">
          {item.label}
        </span>
        <ScoreBadge label={t('diagrams.related.score')} score={item.score} />
      </div>
      <span className="mt-1 block text-xs text-[var(--muted)]">
        {t('diagrams.related.relatedDiagramCount')}:{' '}
        <span className="tabular-nums">{item.relatedDiagramCount}</span>
      </span>
    </div>
  );
}
