'use client';

import { profileApi } from '@/api/profile/profileApi';
import { profileQueryKeys } from '@/api/query/profile-query-keys';
import { useAuth } from '@/components/providers/auth-provider';
import type {
  FavoriteDiagramEntry,
  FavoriteDocumentEntry,
  UserActivityEntry,
  UserProfile,
} from '@/domains/profileDomains';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

export function useMeQuery(): UseQueryResult<UserProfile, Error> {
  const { token, isReady } = useAuth();

  return useQuery<UserProfile, Error>({
    queryKey: profileQueryKeys.me(),
    enabled: isReady && token !== null,
    queryFn: async (): Promise<UserProfile> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return profileApi.getMe(token);
    },
  });
}

export function useFavoriteDocumentsQuery(): UseQueryResult<
  FavoriteDocumentEntry[],
  Error
> {
  const { token, isReady } = useAuth();

  return useQuery<FavoriteDocumentEntry[], Error>({
    queryKey: profileQueryKeys.favoriteDocuments(),
    enabled: isReady && token !== null,
    queryFn: async (): Promise<FavoriteDocumentEntry[]> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return profileApi.listFavoriteDocuments(token);
    },
  });
}

export function useFavoriteDiagramsQuery(): UseQueryResult<
  FavoriteDiagramEntry[],
  Error
> {
  const { token, isReady } = useAuth();

  return useQuery<FavoriteDiagramEntry[], Error>({
    queryKey: profileQueryKeys.favoriteDiagrams(),
    enabled: isReady && token !== null,
    queryFn: async (): Promise<FavoriteDiagramEntry[]> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return profileApi.listFavoriteDiagrams(token);
    },
  });
}

export function useUserActivityQuery(
  params: { from?: string; to?: string } = {},
): UseQueryResult<UserActivityEntry[], Error> {
  const { token, isReady } = useAuth();

  return useQuery<UserActivityEntry[], Error>({
    queryKey: profileQueryKeys.activity(
      params.from ?? null,
      params.to ?? null,
    ),
    enabled: isReady && token !== null,
    queryFn: async (): Promise<UserActivityEntry[]> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return profileApi.getActivity(token, params);
    },
  });
}
