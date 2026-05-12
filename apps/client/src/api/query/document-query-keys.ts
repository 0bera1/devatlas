import type { ListDocumentsQuery } from '@/domains/documentsDomains';

export const documentQueryKeys = {
  all: ['documents'] as const,
  publicFeed: (): readonly ['documents', 'public'] =>
    [...documentQueryKeys.all, 'public'] as const,
  feedLatest: (): readonly ['documents', 'feed', 'latest'] =>
    [...documentQueryKeys.all, 'feed', 'latest'] as const,
  feedTrending: (): readonly ['documents', 'feed', 'trending'] =>
    [...documentQueryKeys.all, 'feed', 'trending'] as const,
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
  related: (
    id: string,
    authBucket: 'auth' | 'anon',
  ): readonly ['documents', 'related', string, 'auth' | 'anon'] =>
    [...documentQueryKeys.all, 'related', id, authBucket] as const,
} as const;
