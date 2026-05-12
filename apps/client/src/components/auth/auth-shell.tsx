'use client';

import { PreferencesControls } from '@/components/preferences/preferences-controls';
import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: {
    text: string;
    linkText: string;
    href: string;
  };
}

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps): ReactNode {
  const { t } = useTranslations();

  return (
    <div className="relative flex min-h-full flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute right-4 top-4 z-10 sm:right-6 lg:right-8">
        <PreferencesControls compact />
      </div>
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {t('auth.backHome')}
          </Link>
          <h1 className="mt-6 font-sans text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {title}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          {children}
        </div>
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          {footer.text}{' '}
          <Link
            href={footer.href}
            className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            {footer.linkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
