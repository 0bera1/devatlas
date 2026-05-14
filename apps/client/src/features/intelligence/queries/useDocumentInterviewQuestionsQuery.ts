'use client';

import { intelligenceApi } from '@/api/intelligence/intelligenceApi';
import {
  intelligenceQueryKeys,
  type IntelligenceAuthBucket,
} from '@/api/query/intelligence-query-keys';
import { useAuth } from '@/components/providers/auth-provider';
import type { RelatedInterviewQuestionsResource } from '@/domains/intelligence/intelligenceDomains';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

function resolveAuthBucket(token: string | null): IntelligenceAuthBucket {
  switch (token) {
    case null:
      return 'anon';
    default:
      return 'auth';
  }
}

export function useDocumentInterviewQuestionsQuery(
  documentId: string,
  enabled: boolean,
): UseQueryResult<RelatedInterviewQuestionsResource, Error> {
  const { token } = useAuth();
  const authBucket: IntelligenceAuthBucket = resolveAuthBucket(token);

  return useQuery({
    queryKey: intelligenceQueryKeys.documentInterviewQuestions(
      documentId,
      authBucket,
    ),
    queryFn: async (): Promise<RelatedInterviewQuestionsResource> => {
      return intelligenceApi.getDocumentInterviewQuestions(documentId, token);
    },
    enabled: enabled && documentId.length > 0,
  });
}
