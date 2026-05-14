'use client';

import { ProfileMethods } from '@/api/MethodNames';
import { profileApi } from '@/api/profile/profileApi';
import { profileQueryKeys } from '@/api/query/profile-query-keys';
import { useAuth } from '@/components/providers/auth-provider';
import type {
  ChangePasswordBody,
  UpdateProfileBody,
  UserProfile,
} from '@/domains/profile/profileDomains';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

export function useUpdateProfileMutation(): UseMutationResult<
  UserProfile,
  Error,
  UpdateProfileBody
> {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationKey: [ProfileMethods.UpdateMe],
    mutationFn: async (body: UpdateProfileBody): Promise<UserProfile> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      return profileApi.updateMe(token, body);
    },
    onSuccess: async (next: UserProfile): Promise<void> => {
      queryClient.setQueryData<UserProfile>(profileQueryKeys.me(), next);
    },
    onSettled: async (): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.me() });
    },
  });
}

export function useChangePasswordMutation(): UseMutationResult<
  void,
  Error,
  ChangePasswordBody
> {
  const { token } = useAuth();

  return useMutation({
    mutationKey: [ProfileMethods.ChangePassword],
    mutationFn: async (body: ChangePasswordBody): Promise<void> => {
      if (token === null) {
        throw new Error('Unauthenticated');
      }
      await profileApi.changePassword(token, body);
    },
  });
}
