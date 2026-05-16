'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { NavbarActions } from './navbar-actions';
import { NavbarContainer } from './navbar-container';
import { NavbarMenu } from './navbar-menu';
import { MobileMenu } from './mobile-menu';
import { useLandingNavbarScroll } from './use-landing-navbar-scroll';

export function Navbar(): ReactNode {
  const isScrolled: boolean = useLandingNavbarScroll();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const { token, isReady } = useAuth();
  const loggedIn: boolean = isReady && token !== null;
  const { t } = useTranslations();

  const closeMobile = useCallback((): void => {
    setMobileOpen(false);
  }, []);

  return (
    <>
      <header
        className={`left-0 right-0 z-[1000] w-full ${
          isScrolled
            ? 'fixed top-0 px-3 pb-2 pt-2 sm:px-5'
            : 'relative px-4 pt-6 sm:px-6 sm:pt-10'
        }`}
      >
        <NavbarContainer isScrolled={isScrolled}>
          <div className="relative flex w-full min-w-0 items-center justify-between gap-2 sm:gap-3">
            <Link
              href="/"
              className={`relative z-20 shrink-0 font-semibold tracking-tight text-zinc-950 transition-[font-size] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none dark:text-zinc-50 ${
                isScrolled
                  ? 'text-lg sm:text-[1.05rem]'
                  : 'text-lg sm:text-xl md:text-2xl'
              }`}
            >
              {t('nav.brand')}
            </Link>

            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:pointer-events-auto lg:block">
              <NavbarMenu isScrolled={isScrolled} />
            </div>

            <div className="relative z-20 flex shrink-0 items-center justify-end gap-2 sm:gap-2.5">
              <div className="hidden lg:flex">
                <NavbarActions
                  isScrolled={isScrolled}
                  isReady={isReady}
                  loggedIn={loggedIn}
                />
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                {!isReady ? (
                  <span className="text-xs text-zinc-400">{t('nav.loading')}</span>
                ) : !loggedIn ? (
                  <>
                    <Link
                      href="/login"
                      className="rounded-full px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-white/70 dark:text-zinc-200 dark:hover:bg-white/10 sm:px-3 sm:text-sm"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet-500/20 transition hover:shadow-violet-500/35 sm:px-3 sm:text-sm"
                    >
                      {t('nav.register')}
                    </Link>
                  </>
                ) : null}
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-white/55 text-zinc-800 shadow-sm backdrop-blur-md transition hover:border-violet-300/60 hover:bg-white/90 hover:shadow-[0_0_20px_-6px_rgba(139,92,246,0.45)] dark:border-zinc-600/80 dark:bg-zinc-900/55 dark:text-zinc-100 dark:hover:border-violet-500/40 dark:hover:bg-zinc-900/90"
                  aria-expanded={mobileOpen}
                  aria-controls="landing-mobile-menu"
                  onClick={() => {
                    setMobileOpen((previous: boolean) => !previous);
                  }}
                >
                  <span className="sr-only">{t('nav.menu.openMenu')}</span>
                  {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
              </div>
            </div>
          </div>
        </NavbarContainer>
      </header>

      {/* Yükseklik animasyonu layout ile çakışıp titremeye yol açıyordu; anında yer açılır */}
      <div
        aria-hidden
        className={`shrink-0 ${isScrolled ? 'h-[3.65rem] sm:h-16' : 'h-0'}`}
      />

      <MobileMenu
        id="landing-mobile-menu"
        isOpen={mobileOpen}
        onClose={closeMobile}
        isReady={isReady}
        loggedIn={loggedIn}
      />
    </>
  );
}

function MenuIcon(): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon(): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
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
