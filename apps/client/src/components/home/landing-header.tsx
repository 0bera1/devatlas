'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Misafirlerin görebildiği iki bölüm. Diğer sayfalar giriş gerektirir. */
const GUEST_LINKS: ReadonlyArray<{ href: string; label: MessageKey }> = [
  { href: '/explore', label: 'nav.explore' },
  { href: '/knowledge', label: 'nav.knowledge' },
];

/** Giriş yapmamış ziyaretçiler için üst çubuk: ana sayfa, Keşif ve Bilgi tabanında ortak. */
export function LandingHeader(): ReactNode {
  const { t } = useTranslations();
  const { isReady } = useAuth();
  const pathname: string = usePathname() ?? '';

  const links = GUEST_LINKS.map((link) => {
    const active: boolean = pathname.startsWith(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? 'page' : undefined}
        className={active ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}
      >
        {t(link.label)}
      </Link>
    );
  });

  return (
    <header className="relative z-40 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-medium tracking-tight">
          <span className="h-3 w-3 rounded-full bg-[var(--accent)]" aria-hidden />
          {t('nav.brand')}
        </Link>

        <nav className="ml-auto hidden items-center gap-6 text-sm sm:flex">{links}</nav>

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

      <nav className="mx-auto flex max-w-6xl gap-6 px-4 pb-3 text-sm sm:hidden">{links}</nav>
    </header>
  );
}
