'use client';

import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';

export interface MatchingKeywordsLineProps {
  readonly keywords: readonly string[];
}

export function MatchingKeywordsLine(
  props: MatchingKeywordsLineProps,
): ReactNode {
  const { keywords } = props;
  const { t } = useTranslations();

  if (keywords.length === 0) {
    return null;
  }

  return (
    <span className="mt-1 block text-[11px] text-violet-600 dark:text-violet-300">
      {t('diagrams.related.matches')}: {keywords.join(', ')}
    </span>
  );
}
