import { ProfileMethods } from '@/api/MethodNames';
import {
  buildProfilePath,
  executeJsonRequest,
  profileHttpVerb,
} from '@/api/http/execute-request';
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
    return executeJsonRequest<UserProfile>({
      method: profileHttpVerb(ProfileMethods.GetMe),
      path: buildProfilePath(ProfileMethods.GetMe),
      accessToken,
    });
  },

  async updateMe(
    accessToken: string,
    body: UpdateProfileBody,
  ): Promise<UserProfile> {
    return executeJsonRequest<UserProfile>({
      method: profileHttpVerb(ProfileMethods.UpdateMe),
      path: buildProfilePath(ProfileMethods.UpdateMe),
      accessToken,
      body,
    });
  },

  async changePassword(
    accessToken: string,
    body: ChangePasswordBody,
  ): Promise<void> {
    await executeJsonRequest<void>({
      method: profileHttpVerb(ProfileMethods.ChangePassword),
      path: buildProfilePath(ProfileMethods.ChangePassword),
      accessToken,
      body,
    });
  },

  async listFavoriteDocuments(
    accessToken: string,
  ): Promise<FavoriteDocumentEntry[]> {
    return executeJsonRequest<FavoriteDocumentEntry[]>({
      method: profileHttpVerb(ProfileMethods.FavoriteDocuments),
      path: buildProfilePath(ProfileMethods.FavoriteDocuments),
      accessToken,
    });
  },

  async listFavoriteDiagrams(
    accessToken: string,
  ): Promise<FavoriteDiagramEntry[]> {
    return executeJsonRequest<FavoriteDiagramEntry[]>({
      method: profileHttpVerb(ProfileMethods.FavoriteDiagrams),
      path: buildProfilePath(ProfileMethods.FavoriteDiagrams),
      accessToken,
    });
  },

  async getActivity(
    accessToken: string,
    query: ActivityQuery = {},
  ): Promise<UserActivityEntry[]> {
    return executeJsonRequest<UserActivityEntry[]>({
      method: profileHttpVerb(ProfileMethods.Activity),
      path: buildProfilePath(ProfileMethods.Activity, query),
      accessToken,
    });
  },
} as const;
