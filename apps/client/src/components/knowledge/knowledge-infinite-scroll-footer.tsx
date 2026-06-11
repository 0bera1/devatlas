'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode, RefObject } from 'react';

interface KnowledgeInfiniteScrollFooterProps {
  readonly sentinelRef: RefObject<HTMLDivElement | null>;
  readonly isFetchingNextPage: boolean;
  readonly hasNextPage: boolean;
}

export function KnowledgeInfiniteScrollFooter(
  props: KnowledgeInfiniteScrollFooterProps,
): ReactNode {
  const { sentinelRef, isFetchingNextPage, hasNextPage } = props;
  const { t } = useTranslations();

  if (!hasNextPage && !isFetchingNextPage) {
    return null;
  }

  return (
    <div
      ref={sentinelRef}
      className="flex justify-center py-4"
      aria-live="polite"
    >
      {isFetchingNextPage ? (
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('knowledge.loadingMore')}
        </span>
      ) : (
        <span className="h-1 w-1" aria-hidden />
      )}
    </div>
  );
}
