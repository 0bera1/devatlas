'use client';

import { intelligenceApi } from '@/api/intelligence/intelligenceApi';
import {
  intelligenceQueryKeys,
  type IntelligenceAuthBucket,
} from '@/api/query/intelligence-query-keys';
import { useAuth } from '@/components/providers/auth-provider';
import type { DiagramIntelligenceResource } from '@/domains/intelligence/intelligenceDomains';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

function resolveAuthBucket(token: string | null): IntelligenceAuthBucket {
  switch (token) {
    case null:
      return 'anon';
    default:
      return 'auth';
  }
}

export function useDiagramIntelligenceQuery(
  diagramId: string,
  enabled: boolean,
): UseQueryResult<DiagramIntelligenceResource, Error> {
  const { token } = useAuth();
  const authBucket: IntelligenceAuthBucket = resolveAuthBucket(token);

  return useQuery({
    queryKey: intelligenceQueryKeys.diagramResources(diagramId, authBucket),
    queryFn: async (): Promise<DiagramIntelligenceResource> => {
      return intelligenceApi.getDiagramResources(diagramId, token);
    },
    enabled: enabled && diagramId.length > 0,
  });
}
