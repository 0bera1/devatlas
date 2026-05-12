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
 * Halka açık doküman akışı GET /documents/public — token gerekmez.
 */
export function usePublicDocumentsQuery(): UseQueryResult<DocumentRecord[], Error> {
  return useQuery({
    queryKey: documentQueryKeys.publicFeed(),
    queryFn: async (): Promise<DocumentRecord[]> => {
      return documentApi.listPublic();
    },
  });
}
