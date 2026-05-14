'use client';

import { PreferencesControls } from '@/components/preferences/preferences-controls';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** Gece gölü / şehir ışıkları — Unsplash (referans görsele yakın atmosfer) */
const AUTH_HERO_SRC: string =
  'https://images.unsplash.com/photo-1644794472051-36d154dfe487?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

export interface AuthShellProps {
  readonly mode: 'login' | 'register';
  readonly children: ReactNode;
}

export function AuthShell({ mode, children }: AuthShellProps): ReactNode {
  const { t } = useTranslations();

  const alternateHref: string = mode === 'login' ? '/register' : '/login';
  const alternateText: string =
    mode === 'login' ? t('auth.split.signUp') : t('auth.split.logIn');
  const ctaText: string =
    mode === 'login' ? t('auth.split.ctaJoin') : t('auth.split.ctaLogin');

  const title: string =
    mode === 'login' ? t('auth.login.title') : t('auth.register.title');
  const description: string =
    mode === 'login'
      ? t('auth.login.description')
      : t('auth.register.description');
  const footerText: string =
    mode === 'login'
      ? t('auth.login.footerText')
      : t('auth.register.footerText');
  const footerLinkText: string =
    mode === 'login'
      ? t('auth.login.footerLink')
      : t('auth.register.footerLink');
  const footerHref: string = mode === 'login' ? '/register' : '/login';

  const registerMirrorClass: string =
    mode === 'register' ? '-scale-x-100' : '';

  return (
    <div
      className={
        mode === 'register'
          ? 'flex min-h-full flex-col-reverse bg-[#121212] text-white md:block md:min-h-screen md:overflow-x-hidden'
          : 'flex min-h-full flex-col bg-[#121212] text-white md:block md:min-h-screen md:overflow-x-hidden'
      }
    >
      <aside
        className={`auth-hero-slide auth-split-visual relative flex min-h-[220px] shrink-0 flex-col justify-between overflow-hidden md:absolute md:top-0 md:z-0 md:h-full md:w-[min(44%,480px)] md:transition-[left] md:duration-700 md:ease-[cubic-bezier(0.25,0.8,0.25,1)] ${registerMirrorClass} ${
          mode === 'login'
            ? 'md:left-0'
            : 'md:left-[calc(100%-min(44%,480px))]'
        }`}
      >
        <div
          className={`relative flex min-h-[220px] flex-1 flex-col justify-between md:min-h-0 md:h-full ${registerMirrorClass}`}
        >
          <div className="absolute inset-0">
            <Image
              src={AUTH_HERO_SRC}
              alt=""
              fill
              priority
              className="auth-hero-motion object-cover object-center"
              sizes="(max-width: 768px) 100vw, 520px"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50"
              aria-hidden
            />
          </div>

          <div className="relative z-[1] flex items-start justify-between gap-3 p-6 md:p-8">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90"
            >
              {t('nav.brand')}
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href={alternateHref}
                className="font-medium text-white/90 transition-colors hover:text-white"
              >
                {alternateText}
              </Link>
              <Link
                href={alternateHref}
                className="rounded-lg border border-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
              >
                {ctaText}
              </Link>
            </div>
          </div>

          <div
            className={
              mode === 'register'
                ? 'relative z-[1] mt-auto flex justify-end p-6 md:p-8'
                : 'relative z-[1] mt-auto flex justify-start p-6 md:p-8'
            }
          >
            <div className="flex max-w-xs items-center gap-3 rounded-xl border border-white/15 bg-black/35 px-4 py-3 backdrop-blur-md">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-sm font-bold text-zinc-900"
                aria-hidden
              >
                DA
              </div>
              <div
                className={
                  mode === 'register' ? 'min-w-0 text-right' : 'min-w-0'
                }
              >
                <p className="truncate text-sm font-semibold text-white">
                  {t('auth.hero.name')}
                </p>
                <p className="truncate text-xs text-white/70">
                  {t('auth.hero.tagline')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main
        className={`auth-main-pad relative flex flex-1 flex-col px-5 py-8 sm:px-10 md:min-h-screen md:flex-none md:py-10 md:transition-[padding] md:duration-700 md:ease-[cubic-bezier(0.25,0.8,0.25,1)] ${
          mode === 'login'
            ? 'md:pl-[min(44%,480px)] md:pr-10 lg:pr-14'
            : 'md:pr-[min(44%,480px)] md:pl-10 lg:pl-14'
        }`}
      >
        <div className="auth-split-animate flex justify-end md:absolute md:right-10 md:top-8 lg:right-14 md:z-10">
          <PreferencesControls variant="auth" />
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center pt-2 md:pt-16">
          <div
            key={mode}
            className="auth-split-animate auth-split-animate-delay-1 mb-8 text-center md:text-left"
          >
            <h1 className="font-sans text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            {description.length > 0 ? (
              <p className="mt-2 text-sm text-zinc-400">{description}</p>
            ) : null}
          </div>

          <div
            key={`form-${mode}`}
            className="auth-split-animate auth-split-animate-delay-2"
          >
            {children}
          </div>

          <p className="auth-split-animate auth-split-animate-delay-3 mt-8 text-center text-sm text-zinc-400 md:text-left">
            {footerText}{' '}
            <Link
              href={footerHref}
              className="font-semibold text-amber-400 transition-colors hover:text-amber-300"
            >
              {footerLinkText}
            </Link>
          </p>

          <p className="mt-6 text-center md:text-left">
            <Link
              href="/"
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            >
              {t('auth.backHome')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
