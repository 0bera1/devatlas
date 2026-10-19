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

/**
 * Misafir üst çubuğu. Tasarımdaki uygulama çubuğu ile aynı dilde: ortada pill biçimli mod çubuğu,
 * sağda giriş ve kayıt. Telefonda mod çubuğu ikinci satıra geçer.
 */
export function LandingHeader(): ReactNode {
  const { t } = useTranslations();
  const { isReady } = useAuth();
  const pathname: string = usePathname() ?? '';

  const modeBar = (
    <nav className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
      {GUEST_LINKS.map((link) => {
        const active: boolean = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              active ? 'bg-[var(--foreground)] font-semibold text-[var(--background)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {t(link.label)}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="relative z-40 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-medium tracking-tight">
          <span className="h-3 w-3 rounded-full bg-[var(--accent)]" aria-hidden />
          {t('nav.brand')}
        </Link>

        <div className="hidden md:block">{modeBar}</div>

        <div className="flex items-center justify-end gap-2">
          {!isReady ? (
            <span className="text-xs text-[var(--muted)]">{t('nav.loading')}</span>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]">
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

      <div className="mx-auto flex max-w-6xl px-4 pb-4 md:hidden sm:px-6">{modeBar}</div>
    </header>
  );
}
