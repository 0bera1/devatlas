'use client';

import { documentApi } from '@/api/documents/documentApi';
import { documentQueryKeys } from '@/api/query/document-query-keys';
import type { DocumentRecord, ListDocumentsQuery, PaginatedDocumentList } from '@/domains/documentsDomains';
import { useAuth } from '@/components/providers/auth-provider';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

/**
 * Doküman listesi (GET /documents + sayfalama & arama).
 * Feature tabanlı query katmanı: queryKey + queryFn.
 */
export function useDocumentsListQuery(
  query: ListDocumentsQuery,
  enabled: boolean,
): UseQueryResult<PaginatedDocumentList, Error> {
  const { token } = useAuth();

  return useQuery({
    queryKey: documentQueryKeys.list(query),
    queryFn: async (): Promise<PaginatedDocumentList> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return documentApi.list(token, query);
    },
    enabled: enabled && token !== null,
  });
}

/**
 * Tek doküman (GET /documents/:id).
 */
export function useDocumentByIdQuery(
  documentId: string,
  enabled: boolean,
): UseQueryResult<DocumentRecord, Error> {
  const { token } = useAuth();

  return useQuery({
    queryKey: documentQueryKeys.detail(documentId),
    queryFn: async (): Promise<DocumentRecord> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return documentApi.getById(token, documentId);
    },
    enabled: enabled && token !== null && documentId.length > 0,
  });
}

/**
 * Halka açık akış GET /feed/latest veya /feed/trending.
 */
export function usePublicFeedQuery(
  mode: 'latest' | 'trending',
): UseQueryResult<DocumentRecord[], Error> {
  return useQuery({
    queryKey:
      mode === 'latest'
        ? documentQueryKeys.feedLatest()
        : documentQueryKeys.feedTrending(),
    queryFn: async (): Promise<DocumentRecord[]> => {
      return mode === 'latest'
        ? documentApi.listFeedLatest()
        : documentApi.listFeedTrending();
    },
  });
}

/**
 * @deprecated Doğrudan {@link usePublicFeedQuery}('latest') tercih edin.
 */
export function usePublicDocumentsQuery(): UseQueryResult<DocumentRecord[], Error> {
  return useQuery({
    queryKey: documentQueryKeys.feedLatest(),
    queryFn: async (): Promise<DocumentRecord[]> => {
      return documentApi.listFeedLatest();
    },
  });
}

/**
 * GET /documents/:id/related — Bearer opsiyonel (özel doküman için gerekir).
 */
export function useRelatedDocumentsQuery(
  documentId: string,
  enabled: boolean,
): UseQueryResult<DocumentRecord[], Error> {
  const { token } = useAuth();
  const hasAuth: boolean = token !== null;
  const authBucket: 'auth' | 'anon' = hasAuth ? 'auth' : 'anon';

  return useQuery({
    queryKey: documentQueryKeys.related(documentId, authBucket),
    queryFn: async (): Promise<DocumentRecord[]> => {
      return documentApi.listRelated(documentId, token);
    },
    enabled: enabled && documentId.length > 0,
  });
}
