'use client';

import { intelligenceApi } from '@/api/intelligence/intelligenceApi';
import { useAuth } from '@/components/providers/auth-provider';
import type {
  AutoTagRequestPayload,
  AutoTagResponse,
} from '@/domains/intelligence/intelligenceDomains';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

/**
 * Heuristic auto-tag motorunu çağıran mutation hook'u.
 * Token varsa Authorization header'a eklenir; endpoint anonim de çalışır.
 */
export function useAutoTagsMutation(): UseMutationResult<
  AutoTagResponse,
  Error,
  AutoTagRequestPayload
> {
  const { token } = useAuth();

  return useMutation({
    mutationKey: ['intelligence', 'auto-tags'],
    mutationFn: async (
      payload: AutoTagRequestPayload,
    ): Promise<AutoTagResponse> => {
      return intelligenceApi.getAutoTags(payload, token);
    },
  });
}
