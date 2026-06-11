import { ProfileMethods } from '@/api/MethodNames';
import { apiClient } from '@/api/http/api-client';
import { buildProfilePath } from '@/api/http/execute-request';
import type {
  ActivityQuery,
  ChangePasswordBody,
  FavoriteDiagramEntry,
  FavoriteDocumentEntry,
  UpdateProfileBody,
  UserActivityEntry,
  UserProfile,
} from '@/domains/profile/profileDomains';

export const profileApi = {
  async getMe(accessToken: string): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(
      buildProfilePath(ProfileMethods.GetMe),
      { accessToken },
    );
    return response.data;
  },

  async updateMe(
    accessToken: string,
    body: UpdateProfileBody,
  ): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>(
      buildProfilePath(ProfileMethods.UpdateMe),
      { accessToken, body },
    );
    return response.data;
  },

  async changePassword(
    accessToken: string,
    body: ChangePasswordBody,
  ): Promise<void> {
    await apiClient.post<void>(
      buildProfilePath(ProfileMethods.ChangePassword),
      { accessToken, body },
    );
  },

  async listFavoriteDocuments(
    accessToken: string,
  ): Promise<FavoriteDocumentEntry[]> {
    const response = await apiClient.get<FavoriteDocumentEntry[]>(
      buildProfilePath(ProfileMethods.FavoriteDocuments),
      { accessToken },
    );
    return response.data;
  },

  async listFavoriteDiagrams(
    accessToken: string,
  ): Promise<FavoriteDiagramEntry[]> {
    const response = await apiClient.get<FavoriteDiagramEntry[]>(
      buildProfilePath(ProfileMethods.FavoriteDiagrams),
      { accessToken },
    );
    return response.data;
  },

  async getActivity(
    accessToken: string,
    query: ActivityQuery = {},
  ): Promise<UserActivityEntry[]> {
    const response = await apiClient.get<UserActivityEntry[]>(
      buildProfilePath(ProfileMethods.Activity, query),
      { accessToken },
    );
    return response.data;
  },
} as const;
