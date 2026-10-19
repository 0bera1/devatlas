'use client';

import { LandingFooter } from '@/components/home/landing-footer';
import { LandingHeader } from '@/components/home/landing-header';
import { LandingHeroGraph } from '@/components/home/landing-hero-graph';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import Link from 'next/link';
import type { ReactNode } from 'react';

const FEATURE_KEYS: ReadonlyArray<{ title: MessageKey; body: MessageKey }> = [
  { title: 'home.story.feature1.title', body: 'home.story.feature1.body' },
  { title: 'home.story.feature2.title', body: 'home.story.feature2.body' },
  { title: 'home.story.feature3.title', body: 'home.story.feature3.body' },
  { title: 'home.story.feature4.title', body: 'home.story.feature4.body' },
];

const SCENARIO_KEYS: ReadonlyArray<{ title: MessageKey; body: MessageKey }> = [
  { title: 'home.scene.card1.title', body: 'home.scene.card1.body' },
  { title: 'home.scene.card2.title', body: 'home.scene.card2.body' },
  { title: 'home.scene.card3.title', body: 'home.scene.card3.body' },
];

/** Giriş yapmamış ziyaretçilere gösterilen ana sayfa (Opsiyon B: serif başlık, kural çizgileri, palet tokenları). */
export function LandingPage(): ReactNode {
  const { t } = useTranslations();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <LandingHeader />

      <main className="flex flex-1 flex-col">
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:pt-24">
          <div>
            <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
              {t('home.story.hero.headline')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">{t('home.story.hero.sub')}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
              >
                {t('home.story.cta.button')}
              </Link>
              <Link
                href="/explore"
                className="rounded-full border border-[var(--border)] px-6 py-3 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
              >
                {t('nav.explore')}
              </Link>
            </div>
          </div>
          <LandingHeroGraph />
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">{t('home.story.problem.title')}</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">{t('home.story.problem.body')}</p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">{t('home.scene.scenario.title')}</h2>
            <p className="text-[15px] text-[var(--muted)]">{t('home.scene.scenario.sub')}</p>
          </div>
          <ul className="mt-10 grid gap-10 border-t border-[var(--border)] pt-10 md:grid-cols-3">
            {SCENARIO_KEYS.map((item) => (
              <li key={item.title}>
                <h3 className="font-serif text-2xl">{t(item.title)}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">{t(item.body)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <ul className="grid gap-x-12 gap-y-12 border-t border-[var(--border)] pt-10 sm:grid-cols-2">
            {FEATURE_KEYS.map((item) => (
              <li key={item.title}>
                <h3 className="font-serif text-2xl">{t(item.title)}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">{t(item.body)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
            <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">{t('home.story.cta.title')}</h2>
            <Link
              href="/register"
              className="w-fit rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
            >
              {t('home.story.cta.button')}
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
