'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function LandingFooter(): ReactNode {
  const { t } = useTranslations();

  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[var(--muted)] sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="font-serif text-base text-[var(--foreground)]">
          {t('nav.brand')} · {t('home.story.footer.tagline')}
        </p>
        <nav className="flex gap-6">
          <Link href="/explore" className="hover:text-[var(--foreground)]">
            {t('home.story.footer.explore')}
          </Link>
          <Link href="/knowledge" className="hover:text-[var(--foreground)]">
            {t('home.story.footer.knowledge')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
