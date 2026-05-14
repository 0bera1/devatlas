'use client';

import { documentApi } from '@/api/documents/documentApi';
import type { PublicSearchHit } from '@/domains/search/searchDomains';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const searchPublicKey = (q: string): readonly ['search', 'public', string] =>
  ['search', 'public', q] as const;

/**
 * Debounced sorgu geldikten sonra GET /search?q= çağırır (en az 1 karakter).
 */
export function useSearchPublicQuery(
  debouncedTrimmedQuery: string,
): UseQueryResult<PublicSearchHit[], Error> {
  const q: string = debouncedTrimmedQuery.trim();

  return useQuery({
    queryKey: searchPublicKey(q),
    queryFn: async (): Promise<PublicSearchHit[]> => {
      return documentApi.searchPublic(q);
    },
    enabled: q.length > 0,
  });
}
