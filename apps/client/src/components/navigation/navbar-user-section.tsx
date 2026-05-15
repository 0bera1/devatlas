'use client';

import { UserDropdown } from '@/components/navigation/user-dropdown';
import { useAuth } from '@/components/providers/auth-provider';
import {
  authProfileQueryKey,
  useAuthProfileQuery,
} from '@/features/auth/queries/useAuthProfile';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { buildUserInitials } from '@/lib/user/build-user-initials';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export interface NavbarUserSectionProps {
  readonly className?: string;
}

export function NavbarUserSection({
  className,
}: NavbarUserSectionProps): ReactNode {
  const { t } = useTranslations();
  const { token, logout, isReady } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionActive: boolean = isReady && token !== null;
  const profileQuery = useAuthProfileQuery(sessionActive);

  const initials: string = useMemo((): string => {
    if (profileQuery.data !== undefined) {
      return buildUserInitials(
        profileQuery.data.firstName,
        profileQuery.data.lastName,
      );
    }
    if (profileQuery.isPending) {
      return '··';
    }
    return '??';
  }, [profileQuery.data, profileQuery.isPending]);

  const handleLogout = (): void => {
    logout();
    queryClient.removeQueries({ queryKey: authProfileQueryKey });
    router.push('/login');
    router.refresh();
  };

  if (!sessionActive) {
    return null;
  }

  return (
    <UserDropdown
      className={className}
      initials={initials}
      triggerAriaLabel={t('nav.userMenuAria')}
      items={[
        {
          id: 'profile',
          label: t('nav.dropdown.viewProfile'),
          onSelect: (): void => {
            router.push('/profile');
          },
        },
        {
          id: 'logout',
          label: t('nav.logout'),
          variant: 'danger',
          onSelect: handleLogout,
        },
      ]}
    />
  );
}
