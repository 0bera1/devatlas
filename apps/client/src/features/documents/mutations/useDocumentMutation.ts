'use client';

import { DocumentMethods } from '@/api/MethodNames';
import { documentApi } from '@/api/documents/documentApi';
import { documentQueryKeys } from '@/api/query/document-query-keys';
import { useAuth } from '@/components/providers/auth-provider';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type {
  DocumentRecord,
  PatchDocumentTitleVariables,
  UpdateDocumentContentVariables,
} from '@/domains/documentsDomains';

/**
 * POST {@link DocumentMethods.Create} — yeni doküman.
 * Kullanım: `const { mutate: createDocuments } = useCreateDocumentMutation();`
 */
export function useCreateDocumentMutation(): UseMutationResult<
  DocumentRecord,
  Error,
  string
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: [DocumentMethods.Create],
    mutationFn: async (title: string): Promise<DocumentRecord> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return documentApi.create(token, { title });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.lists() });
    },
  });
}

/**
 * PATCH {@link DocumentMethods.PatchTitle}
 */
export function usePatchDocumentTitleMutation(): UseMutationResult<
  DocumentRecord,
  Error,
  PatchDocumentTitleVariables
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: [DocumentMethods.PatchTitle],
    mutationFn: async (
      variables: PatchDocumentTitleVariables,
    ): Promise<DocumentRecord> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return documentApi.patchTitle(token, variables.documentId, {
        title: variables.title,
      });
    },
    onSettled: async (_data, _err, variables) => {
      await queryClient.invalidateQueries({
        queryKey: documentQueryKeys.detail(variables.documentId),
      });
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.lists() });
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
    onSettled: async (_data, _err, variables) => {
      await queryClient.invalidateQueries({
        queryKey: documentQueryKeys.detail(variables.documentId),
      });
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.lists() });
    },
  });
}
