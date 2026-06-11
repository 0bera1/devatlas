import type { PaginatedKnowledgeList } from '@/domains/knowledge/knowledgeDomains';
import type { InfiniteData } from '@tanstack/react-query';

export function flattenKnowledgePages<T>(
  pages: readonly PaginatedKnowledgeList<T>[] | undefined,
): readonly T[] {
  if (pages === undefined) {
    return [];
  }
  return pages.flatMap((page: PaginatedKnowledgeList<T>) => [...page.items]);
}

export function flattenKnowledgeInfiniteData<T>(
  data: InfiniteData<PaginatedKnowledgeList<T>> | undefined,
): readonly T[] {
  if (data === undefined) {
    return [];
  }
  return flattenKnowledgePages(data.pages);
}

export function getKnowledgeNextPage<T>(
  lastPage: PaginatedKnowledgeList<T>,
): number | undefined {
  if (lastPage.page >= lastPage.totalPages) {
    return undefined;
  }
  return lastPage.page + 1;
}
