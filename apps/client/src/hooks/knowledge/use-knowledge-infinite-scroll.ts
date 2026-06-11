'use client';

import { useIntersectionObserver } from '@/hooks/ui/use-intersection-observer';
import { useCallback, type RefObject } from 'react';

export interface UseKnowledgeInfiniteScrollOptions {
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly fetchNextPage: () => void;
}

export interface UseKnowledgeInfiniteScrollResult {
  readonly sentinelRef: RefObject<HTMLDivElement | null>;
}

export function useKnowledgeInfiniteScroll(
  options: UseKnowledgeInfiniteScrollOptions,
): UseKnowledgeInfiniteScrollResult {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = options;

  const onIntersect = useCallback((): void => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const sentinelRef = useIntersectionObserver({
    enabled: hasNextPage,
    onIntersect,
  });

  return { sentinelRef };
}
