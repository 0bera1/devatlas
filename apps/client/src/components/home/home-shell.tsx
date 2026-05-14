'use client';

import { PreferencesControls } from '@/components/preferences/preferences-controls';
import { useAuth } from '@/components/providers/auth-provider';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function HomeShell({ children }: { children: ReactNode }): ReactNode {
  const { t } = useTranslations();
  const { token, isReady, logout } = useAuth();
  const loggedIn: boolean = isReady && token !== null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-6">
          <Link
            href="/"
            className="shrink-0 font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
          >
            {t('nav.brand')}
          </Link>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3">
            <PreferencesControls compact />
            <nav className="flex items-center gap-3 text-sm font-medium sm:gap-4">
              <Link
                href="/explore"
                className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {t('nav.explore')}
              </Link>
              <Link
                href="/knowledge"
                className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {t('nav.knowledge')}
              </Link>
              <Link
                href="/search"
                className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {t('nav.search')}
              </Link>
              {!isReady ? (
                <span className="text-zinc-400">{t('nav.loading')}</span>
              ) : loggedIn ? (
                <>
                  <Link
                    href="/documents"
                    className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    {t('nav.documents')}
                  </Link>
                  <Link
                    href="/diagrams"
                    className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    {t('nav.diagrams')}
                  </Link>
                  <Link
                    href="/profile"
                    className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    {t('nav.profile')}
                  </Link>
                  <span className="hidden text-zinc-500 sm:inline dark:text-zinc-400">
                    {t('nav.sessionActive')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                    }}
                    className="rounded-lg px-3 py-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
