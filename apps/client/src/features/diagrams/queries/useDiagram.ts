'use client';

import { diagramApi } from '@/api/diagrams/diagramApi';
import { diagramQueryKeys } from '@/api/query/diagram-query-keys';
import { useAuth } from '@/components/providers/auth-provider';
import type {
  DiagramCollaboratorEntry,
  DiagramRecord,
  DiagramSummary,
} from '@/domains/diagram/diagramDomains';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

export function useDiagramsListQuery(
  enabled: boolean,
): UseQueryResult<DiagramSummary[], Error> {
  const { token } = useAuth();

  return useQuery({
    queryKey: diagramQueryKeys.lists(),
    queryFn: async (): Promise<DiagramSummary[]> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return diagramApi.list(token);
    },
    enabled: enabled && token !== null,
  });
}

export function useDiagramByIdQuery(
  diagramId: string,
  enabled: boolean,
): UseQueryResult<DiagramRecord, Error> {
  const { token } = useAuth();

  return useQuery({
    queryKey: diagramQueryKeys.detail(diagramId),
    queryFn: async (): Promise<DiagramRecord> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return diagramApi.getById(token, diagramId);
    },
    enabled: enabled && token !== null && diagramId.length > 0,
  });
}

export function useDiagramCollaboratorsQuery(
  diagramId: string,
  enabled: boolean,
): UseQueryResult<DiagramCollaboratorEntry[], Error> {
  const { token } = useAuth();

  return useQuery({
    queryKey: diagramQueryKeys.collaborators(diagramId),
    queryFn: async (): Promise<DiagramCollaboratorEntry[]> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return diagramApi.listCollaborators(token, diagramId);
    },
    enabled: enabled && token !== null && diagramId.length > 0,
  });
}

export function useRelatedDiagramsQuery(
  diagramId: string,
  enabled: boolean,
): UseQueryResult<DiagramSummary[], Error> {
  const { token } = useAuth();
  const hasAuth: boolean = token !== null;
  const authBucket: 'auth' | 'anon' = hasAuth ? 'auth' : 'anon';

  return useQuery({
    queryKey: diagramQueryKeys.related(diagramId, authBucket),
    queryFn: async (): Promise<DiagramSummary[]> => {
      return diagramApi.listRelated(diagramId, token);
    },
    enabled: enabled && diagramId.length > 0,
  });
}
