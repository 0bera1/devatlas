'use client';

import { MatchingKeywordsLine } from '@/components/diagrams/intelligence/matching-keywords-line';
import { ScoreBadge } from '@/components/diagrams/intelligence/score-badge';
import type { ScoredDocumentRecommendation } from '@/domains/intelligenceDomains';
import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface RelatedDocumentCardProps {
  readonly item: ScoredDocumentRecommendation;
}

export function RelatedDocumentCard(
  props: RelatedDocumentCardProps,
): ReactNode {
  const { item } = props;
  const { t } = useTranslations();

  return (
    <Link
      href={`/documents/${item.id}`}
      className="block rounded-xl border border-zinc-200 px-3 py-2 text-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-zinc-950 dark:text-zinc-50">
          {item.title}
        </span>
        <ScoreBadge label={t('diagrams.related.score')} score={item.score} />
      </div>
      <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
        {t('documents.engagement.favorites')}: {item.favoriteCount} ·{' '}
        {t('documents.engagement.views')}: {item.viewCount}
      </span>
      <MatchingKeywordsLine keywords={item.matchingKeywords} />
    </Link>
  );
}
