'use client';

import { authApi } from '@/api/auth/authApi';
import { useAuth } from '@/components/providers/auth-provider';
import type { PublicUser } from '@/domains/auth/authDomains';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

export const authProfileQueryKey = ['auth', 'profile'] as const;

export function useAuthProfileQuery(
  enabled: boolean,
): UseQueryResult<PublicUser, Error> {
  const { token } = useAuth();

  return useQuery({
    queryKey: authProfileQueryKey,
    queryFn: async (): Promise<PublicUser> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return authApi.getProfile(token);
    },
    enabled: enabled && token !== null,
    staleTime: 60_000,
  });
}
