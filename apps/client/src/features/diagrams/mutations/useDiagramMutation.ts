'use client';

import { DiagramMethods } from '@/api/MethodNames';
import { diagramApi } from '@/api/diagrams/diagramApi';
import { diagramQueryKeys } from '@/api/query/diagram-query-keys';
import { profileQueryKeys } from '@/api/query/profile-query-keys';
import { useAuth } from '@/components/providers/auth-provider';
import type {
  CreateDiagramBody,
  DiagramCollaboratorEntry,
  DiagramRecord,
  PatchDiagramBody,
  SaveDiagramGraphBody,
} from '@/domains/diagramDomains';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

async function invalidateDiagramCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  diagramId: string,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: diagramQueryKeys.detail(diagramId),
  });
  await queryClient.invalidateQueries({
    queryKey: diagramQueryKeys.related(diagramId, 'auth'),
  });
  await queryClient.invalidateQueries({
    queryKey: diagramQueryKeys.related(diagramId, 'anon'),
  });
  await queryClient.invalidateQueries({
    queryKey: diagramQueryKeys.collaborators(diagramId),
  });
  await queryClient.invalidateQueries({ queryKey: diagramQueryKeys.lists() });
}

export function useCreateDiagramMutation(): UseMutationResult<
  DiagramRecord,
  Error,
  CreateDiagramBody
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: ['diagrams', 'create'],
    mutationFn: async (body: CreateDiagramBody): Promise<DiagramRecord> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return diagramApi.create(token, body);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: diagramQueryKeys.lists() });
    },
  });
}

export function useSaveDiagramGraphMutation(): UseMutationResult<
  DiagramRecord,
  Error,
  { readonly diagramId: string; readonly body: SaveDiagramGraphBody }
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: ['diagrams', 'saveGraph'],
    mutationFn: async (variables: {
      readonly diagramId: string;
      readonly body: SaveDiagramGraphBody;
    }): Promise<DiagramRecord> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return diagramApi.saveGraph(token, variables.diagramId, variables.body);
    },
    onSuccess: (record, variables): void => {
      if (record !== undefined && record !== null) {
        queryClient.setQueryData(
          diagramQueryKeys.detail(variables.diagramId),
          record,
        );
      }
    },
    onSettled: async (_d, _e, variables) => {
      await invalidateDiagramCaches(queryClient, variables.diagramId);
      await queryClient.invalidateQueries({ queryKey: ['search'] });
    },
  });
}

export function usePatchDiagramMutation(): UseMutationResult<
  DiagramRecord,
  Error,
  { readonly diagramId: string; readonly body: PatchDiagramBody }
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: ['diagrams', 'patch'],
    mutationFn: async (variables: {
      readonly diagramId: string;
      readonly body: PatchDiagramBody;
    }): Promise<DiagramRecord> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return diagramApi.patch(token, variables.diagramId, variables.body);
    },
    onSuccess: (record, variables): void => {
      queryClient.setQueryData(diagramQueryKeys.detail(variables.diagramId), record);
    },
    onSettled: async (_d, _e, variables) => {
      await invalidateDiagramCaches(queryClient, variables.diagramId);
      await queryClient.invalidateQueries({ queryKey: ['search'] });
    },
  });
}

export function useAddDiagramCollaboratorMutation(): UseMutationResult<
  DiagramCollaboratorEntry[],
  Error,
  { readonly diagramId: string; readonly email: string }
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: ['diagrams', 'addCollaborator'],
    mutationFn: async (variables: {
      readonly diagramId: string;
      readonly email: string;
    }): Promise<DiagramCollaboratorEntry[]> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return diagramApi.addCollaborator(
        token,
        variables.diagramId,
        variables.email,
      );
    },
    onSettled: async (_d, _e, variables) => {
      await invalidateDiagramCaches(queryClient, variables.diagramId);
    },
  });
}

export function useDeleteDiagramMutation(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: [DiagramMethods.Delete],
    mutationFn: async (diagramId: string): Promise<void> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      await diagramApi.remove(token, diagramId);
    },
    onSettled: async (_d, _e, diagramId) => {
      await invalidateDiagramCaches(queryClient, diagramId);
      await queryClient.invalidateQueries({ queryKey: ['search'] });
    },
  });
}

export function useFavoriteDiagramMutation(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: [DiagramMethods.FavoriteDiagram],
    mutationFn: async (diagramId: string): Promise<void> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      await diagramApi.favorite(token, diagramId);
    },
    onSettled: async (_d, _e, diagramId) => {
      await invalidateDiagramCaches(queryClient, diagramId);
      await queryClient.invalidateQueries({
        queryKey: profileQueryKeys.favoriteDiagrams(),
      });
    },
  });
}

export function useRemoveDiagramCollaboratorMutation(): UseMutationResult<
  DiagramCollaboratorEntry[],
  Error,
  { readonly diagramId: string; readonly userId: string }
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: ['diagrams', 'removeCollaborator'],
    mutationFn: async (variables: {
      readonly diagramId: string;
      readonly userId: string;
    }): Promise<DiagramCollaboratorEntry[]> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return diagramApi.removeCollaborator(
        token,
        variables.diagramId,
        variables.userId,
      );
    },
    onSettled: async (_d, _e, variables) => {
      await invalidateDiagramCaches(queryClient, variables.diagramId);
    },
  });
}
