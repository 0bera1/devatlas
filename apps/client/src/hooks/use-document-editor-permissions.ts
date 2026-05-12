'use client';

import type { PublicUser } from '@/domains/authDomains';
import { useAuthProfileQuery } from '@/features/auth/queries/useAuthProfile';
import { useMemo } from 'react';

export interface UseDocumentEditorPermissionsResult {
  readonly permissionReady: boolean;
  readonly canEdit: boolean;
  readonly profile: PublicUser | undefined;
}

/**
 * Doküman editöründe oturum profili yüklenene kadar bekler; sahip kontrolü yapar.
 */
export function useDocumentEditorPermissions(
  authEnabled: boolean,
  ownerId: string,
): UseDocumentEditorPermissionsResult {
  const { data: profile, isPending } = useAuthProfileQuery(authEnabled);

  return useMemo((): UseDocumentEditorPermissionsResult => {
    const permissionReady: boolean = !isPending;
    const canEdit: boolean =
      permissionReady &&
      profile !== undefined &&
      profile.id === ownerId;

    return {
      permissionReady,
      canEdit,
      profile,
    };
  }, [isPending, ownerId, profile]);
}
