'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** Giriş yapmamış ziyaretçiler için üst çubuk. Oturumu açık kullanıcılar zaten /today'e yönlendirilir. */
export function LandingHeader(): ReactNode {
  const { t } = useTranslations();
  const { isReady } = useAuth();

  return (
    <header className="relative z-40 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-medium tracking-tight">
          <span className="h-3 w-3 rounded-full bg-[var(--accent)]" aria-hidden />
          {t('nav.brand')}
        </Link>

        <nav className="ml-auto hidden items-center gap-6 text-sm text-[var(--muted)] sm:flex">
          <Link href="/explore" className="hover:text-[var(--foreground)]">
            {t('nav.explore')}
          </Link>
          <Link href="/knowledge" className="hover:text-[var(--foreground)]">
            {t('nav.knowledge')}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {!isReady ? (
            <span className="text-xs text-[var(--muted)]">{t('nav.loading')}</span>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
              >
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
