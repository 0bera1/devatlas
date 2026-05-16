'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { landingNavLinks } from './landing-nav-config';

const itemEase =
  'transition-[color,background-color,box-shadow,padding] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none';

const shellEase =
  'transition-[padding,box-shadow] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none';

export interface NavbarMenuProps {
  readonly isScrolled: boolean;
}

export function NavbarMenu({ isScrolled }: NavbarMenuProps): ReactNode {
  const pathname: string = usePathname();
  const { t } = useTranslations();

  return (
    <div
      className={`inline-flex max-w-full items-center rounded-full border border-zinc-200/90 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-sm dark:border-zinc-600/80 dark:bg-zinc-900/50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${shellEase} ${
        isScrolled ? 'px-0.5 py-0.5' : 'px-1 py-1 sm:px-1.5 sm:py-1.5'
      }`}
    >
      <nav
        aria-label="Primary"
        className="flex max-w-full flex-wrap items-center justify-center gap-0.5 sm:gap-1 "
      >
        {landingNavLinks.map((item) => {
          const active: boolean = item.isActive(pathname);
          return (
            <Link
              key={`${item.href}-${item.labelKey}`}
              href={item.href}
              className={`relative rounded-2xl font-medium ${itemEase} ${
                isScrolled
                  ? 'px-2 py-1.5 text-[12px] sm:px-2.5 sm:py-2 sm:text-[13px]'
                  : 'px-2.5 py-2 text-[13px] sm:px-3 sm:py-2 sm:text-sm'
              } ${
                active
                  ? 'text-violet-700 dark:text-violet-300'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50'
              } hover:bg-white/75 hover:shadow-[0_0_20px_-10px_rgba(99,102,241,0.45)] dark:hover:bg-white/[0.08] dark:hover:shadow-[0_0_24px_-10px_rgba(167,139,250,0.35)]`}
            >
              {active ? (
                <span
                  className="pointer-events-none absolute inset-x-1.5 bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 opacity-90"
                  aria-hidden
                />
              ) : null}
              <span className="relative z-10">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
