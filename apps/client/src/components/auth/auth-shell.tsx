'use client';

import { PreferencesControls } from '@/components/preferences/preferences-controls';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface AuthShellProps {
  readonly mode: 'login' | 'register';
  readonly children: ReactNode;
}

/** Giriş, kayıt ve hesap kurtarma ekranlarının ortak kabuğu. Sol panel sistemi tanıtır, sağ sütunda form durur. */
export function AuthShell({ mode, children }: AuthShellProps): ReactNode {
  const { t } = useTranslations();

  const title: string = mode === 'login' ? t('auth.login.title') : t('auth.register.title');
  const description: string = mode === 'login' ? t('auth.login.description') : t('auth.register.description');
  const footerText: string = mode === 'login' ? t('auth.login.footerText') : t('auth.register.footerText');
  const footerLinkText: string = mode === 'login' ? t('auth.login.footerLink') : t('auth.register.footerLink');
  const footerHref: string = mode === 'login' ? '/register' : '/login';

  return (
    <div className="grid min-h-screen bg-[var(--background)] text-[var(--foreground)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <aside className="hidden flex-col justify-between border-r border-[var(--border)] bg-[var(--surface)] p-10 md:flex lg:p-14">
        <Link href="/" className="flex w-fit items-center gap-2 font-serif text-xl font-medium tracking-tight">
          <span className="h-3 w-3 rounded-full bg-[var(--accent)]" aria-hidden />
          {t('nav.brand')}
        </Link>
        <div>
          <p className="max-w-md font-serif text-4xl font-medium leading-tight tracking-tight lg:text-5xl">
            {t('home.story.hero.headline')}
          </p>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">{t('home.story.hero.sub')}</p>
        </div>
        <p className="text-xs text-[var(--muted)]">{t('auth.hero.tagline')}</p>
      </aside>

      <main className="flex flex-col px-5 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="font-serif text-lg font-medium tracking-tight md:invisible">
            {t('nav.brand')}
          </Link>
          <PreferencesControls variant="auth" />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <header className="mb-8">
            <h1 className="font-serif text-4xl font-medium tracking-tight">{title}</h1>
            {description.length > 0 ? <p className="mt-2 text-sm text-[var(--muted)]">{description}</p> : null}
          </header>

          {children}

          <p className="mt-8 text-sm text-[var(--muted)]">
            {footerText}{' '}
            <Link
              href={footerHref}
              className="font-semibold text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--accent)]"
            >
              {footerLinkText}
            </Link>
          </p>

          <p className="mt-6">
            <Link href="/" className="text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
              {t('auth.backHome')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
