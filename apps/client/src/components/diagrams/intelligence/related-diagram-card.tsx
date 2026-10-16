'use client';

import { MatchingKeywordsLine } from '@/components/diagrams/intelligence/matching-keywords-line';
import { ScoreBadge } from '@/components/diagrams/intelligence/score-badge';
import type { ScoredDiagramRecommendation } from '@/domains/intelligence/intelligenceDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface RelatedDiagramCardProps {
  readonly item: ScoredDiagramRecommendation;
}

export function RelatedDiagramCard(props: RelatedDiagramCardProps): ReactNode {
  const { item } = props;
  const { t } = useTranslations();

  return (
    <Link
      href={`/diagrams/${item.id}`}
      className="block rounded-xl border border-[var(--border)] px-3 py-2 text-sm transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-[var(--foreground)]">
          {item.title}
        </span>
        <ScoreBadge label={t('diagrams.related.score')} score={item.score} />
      </div>
      <span className="mt-1 block text-xs text-[var(--muted)]">
        {item.nodeCount} {t('diagrams.list.nodes')}
      </span>
      <MatchingKeywordsLine keywords={item.matchingKeywords} />
    </Link>
  );
}
