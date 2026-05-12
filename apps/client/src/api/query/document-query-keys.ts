import type { ListDocumentsQuery } from '@/domains/documentsDomains';

export const documentQueryKeys = {
  all: ['documents'] as const,
  lists: (): readonly ['documents', 'list'] =>
    [...documentQueryKeys.all, 'list'] as const,
  list: (
    query: ListDocumentsQuery,
  ): readonly ['documents', 'list', ListDocumentsQuery] =>
    [...documentQueryKeys.lists(), query] as const,
  details: (): readonly ['documents', 'detail'] =>
    [...documentQueryKeys.all, 'detail'] as const,
  detail: (id: string): readonly ['documents', 'detail', string] =>
    [...documentQueryKeys.details(), id] as const,
} as const;
