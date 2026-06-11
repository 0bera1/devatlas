'use client';

import { useScrollProgress } from '@/components/scene/useScrollProgress';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { FOOTER_SCROLL_START, map } from '@/lib/sceneMath';
import { useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export function LandingScrollHint(): ReactNode {
  const { t } = useTranslations();
  const progress: number = useScrollProgress();
  const reduceMotion: boolean | null = useReducedMotion();

  const opacity: number = useMemo((): number => {
    if (progress >= FOOTER_SCROLL_START) {
      return 0;
    }
    const fadeStart: number = FOOTER_SCROLL_START - 0.1;
    if (progress <= fadeStart) {
      return 1;
    }
    return 1 - map(progress, fadeStart, FOOTER_SCROLL_START);
  }, [progress]);

  if (opacity < 0.02) {
    return null;
  }

  const chevronClass: string = reduceMotion
    ? 'text-zinc-500 dark:text-zinc-400'
    : 'landing-scroll-hint-chevron text-zinc-500 dark:text-zinc-400';

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-8 z-30 flex flex-col items-center gap-2 transition-opacity duration-300 motion-reduce:transition-none"
      style={{ opacity }}
      aria-hidden={opacity < 0.4}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
        {t('home.story.scrollHint')}
      </span>
      <svg
        className={chevronClass}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
