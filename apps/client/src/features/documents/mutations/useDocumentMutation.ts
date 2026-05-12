'use client';

import { DocumentMethods } from '@/api/MethodNames';
import { documentApi } from '@/api/documents/documentApi';
import { documentQueryKeys } from '@/api/query/document-query-keys';
import { useAuth } from '@/components/providers/auth-provider';
import type {
  CreateDocumentBody,
  DocumentRecord,
  PatchDocumentVariables,
  UpdateDocumentContentVariables,
} from '@/domains/documentsDomains';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

async function invalidateFeedQueries(
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: documentQueryKeys.publicFeed(),
  });
  await queryClient.invalidateQueries({
    queryKey: documentQueryKeys.feedLatest(),
  });
  await queryClient.invalidateQueries({
    queryKey: documentQueryKeys.feedTrending(),
  });
}

async function invalidateDocumentCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  documentId: string,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: documentQueryKeys.detail(documentId),
  });
  await queryClient.invalidateQueries({
    queryKey: documentQueryKeys.related(documentId, 'auth'),
  });
  await queryClient.invalidateQueries({
    queryKey: documentQueryKeys.related(documentId, 'anon'),
  });
  await queryClient.invalidateQueries({ queryKey: documentQueryKeys.lists() });
  await invalidateFeedQueries(queryClient);
}

/**
 * POST {@link DocumentMethods.Create}
 */
export function useCreateDocumentMutation(): UseMutationResult<
  DocumentRecord,
  Error,
  CreateDocumentBody
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: [DocumentMethods.Create],
    mutationFn: async (body: CreateDocumentBody): Promise<DocumentRecord> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return documentApi.create(token, body);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.lists() });
      await invalidateFeedQueries(queryClient);
    },
  });
}

/**
 * PATCH — başlık / görünürlük
 */
export function usePatchDocumentMutation(): UseMutationResult<
  DocumentRecord,
  Error,
  PatchDocumentVariables
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: [DocumentMethods.PatchDocument],
    mutationFn: async (
      variables: PatchDocumentVariables,
    ): Promise<DocumentRecord> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return documentApi.patchDocument(
        token,
        variables.documentId,
        variables.patch,
      );
    },
    onSettled: async (_d, _e, variables) => {
      await invalidateDocumentCaches(queryClient, variables.documentId);
    },
  });
}

/**
 * PUT {@link DocumentMethods.UpdateContent}
 */
export function useUpdateDocumentContentMutation(): UseMutationResult<
  DocumentRecord,
  Error,
  UpdateDocumentContentVariables
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: [DocumentMethods.UpdateContent],
    mutationFn: async (
      variables: UpdateDocumentContentVariables,
    ): Promise<DocumentRecord> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return documentApi.updateContent(token, variables.documentId, {
        content: variables.content,
      });
    },
    onSettled: async (_d, _e, variables) => {
      await invalidateDocumentCaches(queryClient, variables.documentId);
    },
  });
}

/**
 * POST — doküman favorile (yalnızca erişilebilir doküman; tekrar 409).
 */
export function useFavoriteDocumentMutation(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: [DocumentMethods.FavoriteDocument],
    mutationFn: async (documentId: string): Promise<void> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      await documentApi.addFavorite(token, documentId);
    },
    onSettled: async (_d, _e, documentId) => {
      await queryClient.invalidateQueries({
        queryKey: documentQueryKeys.detail(documentId),
      });
      await invalidateFeedQueries(queryClient);
    },
  });
}
