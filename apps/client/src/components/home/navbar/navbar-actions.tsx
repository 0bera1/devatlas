'use client';

import { NavbarUserSection } from '@/components/navigation/navbar-user-section';
import { PreferencesControls } from '@/components/preferences/preferences-controls';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

const linkEase =
  'transition-[color,background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-colors';

export interface NavbarActionsProps {
  readonly isScrolled: boolean;
  readonly isReady: boolean;
  readonly loggedIn: boolean;
}

export function NavbarActions({
  isScrolled,
  isReady,
  loggedIn,
}: NavbarActionsProps): ReactNode {
  const { t } = useTranslations();
  const showUserChrome: boolean = isReady && loggedIn;

  const linkPad: string = isScrolled
    ? 'rounded-full px-3 py-1.5 text-sm'
    : 'rounded-full px-3 py-1.5 text-sm';

  return (
    <div
      className={`flex shrink-0 items-center justify-end gap-2 sm:gap-3 ${isScrolled ? '' : 'sm:gap-3.5'} transition-[gap] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}
    >
      {!isReady ? (
        <span className="text-sm text-zinc-400">{t('nav.loading')}</span>
      ) : showUserChrome ? (
        <>
          <PreferencesControls compact />
          <NavbarUserSection />
        </>
      ) : (
        <>
          <Link
            href="/login"
            className={`font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 ${linkPad} ${linkEase} hover:bg-white/55 dark:hover:bg-white/10`}
          >
            {t('nav.login')}
          </Link>
          <Link
            href="/register"
            className={`rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_100%] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 ${linkEase} hover:bg-[position:100%_0] hover:shadow-violet-500/40 dark:shadow-violet-900/40 sm:px-5${
              isScrolled ? ' py-1.5 text-[13px]' : ''
            }`}
          >
            {t('nav.register')}
          </Link>
          <PreferencesControls compact />
        </>
      )}
    </div>
  );
}
