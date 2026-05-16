'use client';

import { NavbarUserSection } from '@/components/navigation/navbar-user-section';
import { PreferencesControls } from '@/components/preferences/preferences-controls';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';
import { landingNavLinks } from './landing-nav-config';

const panelEase =
  'transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-opacity';

export interface MobileMenuProps {
  readonly id: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isReady: boolean;
  readonly loggedIn: boolean;
}

export function MobileMenu({
  id,
  isOpen,
  onClose,
  isReady,
  loggedIn,
}: MobileMenuProps): ReactNode {
  const pathname: string = usePathname();
  const { t } = useTranslations();

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return;
    }
    const previousOverflow: string = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return (): void => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return (): void => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const handleNavigate = useCallback((): void => {
    onClose();
  }, [onClose]);

  return (
    <div
      id={id}
      className={`fixed inset-0 z-[1100] lg:hidden ${panelEase} ${
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px] transition-opacity dark:bg-black/55"
        aria-label={t('nav.menu.closeMenu')}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-white/20 bg-[rgba(255,255,255,0.92)] shadow-2xl shadow-zinc-900/20 backdrop-blur-xl dark:border-zinc-700/50 dark:bg-[rgba(9,9,11,0.92)] ${panelEase} ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-4 dark:border-zinc-800/80">
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t('nav.brand')}
          </span>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
            onClick={onClose}
            aria-label={t('nav.menu.closeMenu')}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
          {landingNavLinks.map((item) => {
            const active: boolean = item.isActive(pathname);
            return (
              <Link
                key={`m-${item.href}-${item.labelKey}`}
                href={item.href}
                onClick={handleNavigate}
                className={`rounded-xl px-3 py-3 text-base font-medium transition ${
                  active
                    ? 'bg-violet-500/10 text-violet-800 dark:text-violet-200'
                    : 'text-zinc-700 hover:bg-white/80 dark:text-zinc-200 dark:hover:bg-white/5'
                }`}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}

          {!isReady ? (
            <span className="px-3 py-2 text-sm text-zinc-400">{t('nav.loading')}</span>
          ) : loggedIn ? (
            <div className="mt-2 border-t border-zinc-200/80 px-2 pt-4 dark:border-zinc-800/80">
              <NavbarUserSection />
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-2 border-t border-zinc-200/80 pt-4 dark:border-zinc-800/80">
              <Link
                href="/login"
                onClick={handleNavigate}
                className="rounded-xl px-3 py-3 text-center text-base font-medium text-zinc-800 hover:bg-white/80 dark:text-zinc-100 dark:hover:bg-white/5"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                onClick={handleNavigate}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-3 text-center text-base font-semibold text-white shadow-lg shadow-violet-500/25"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </nav>

        <div className="border-t border-zinc-200/80 px-4 py-4 dark:border-zinc-800/80">
          <PreferencesControls compact />
        </div>
      </div>
    </div>
  );
}

function CloseIcon(): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
