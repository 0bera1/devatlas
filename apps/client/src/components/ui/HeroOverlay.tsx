'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { GraphSimulationState } from '@/lib/sceneMath';
import type { ReactNode } from 'react';

interface HeroOverlayProps {
  readonly physics: GraphSimulationState;
}

export function HeroOverlay(props: HeroOverlayProps): ReactNode {
  const { physics } = props;
  const { t } = useTranslations();
  const reduceMotion: boolean | null = useReducedMotion();
  const o: number = physics.beatHero;

  if (o < 0.03) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center"
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: o, y: 0, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0.15 : 0.85,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-600 dark:text-zinc-500">
          DevAtlas
        </p>
        <h1 className="mt-4 max-w-4xl bg-gradient-to-br from-zinc-900 via-violet-700 to-cyan-700 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent dark:from-zinc-100 dark:via-violet-200 dark:to-cyan-200 sm:text-5xl md:text-6xl">
          {t('home.story.hero.headline')}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
          {t('home.story.hero.sub')}
        </p>
      </div>
    </motion.div>
  );
}
