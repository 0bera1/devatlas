'use client';

import Link from 'next/link';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { GraphSimulationState } from '@/lib/sceneMath';
import { deriveScenePhysics, FOOTER_SCROLL_START, map } from '@/lib/sceneMath';
import { useScrollProgress } from '@/components/scene/useScrollProgress';
import { useSceneStore } from '@/store/useSceneStore';
import type { ReactNode } from 'react';

export function SceneFooter(): ReactNode {
  const { t } = useTranslations();
  const progress: number = useScrollProgress();
  const boost: number = useSceneStore((s) => s.interactionBoost);
  const physics: GraphSimulationState = deriveScenePhysics(progress, boost);
  const opacity: number =
    0.35 +
    map(progress, FOOTER_SCROLL_START, 1) * 0.45 +
    physics.density * 0.12;

  return (
    <footer
      className="pointer-events-auto relative z-20 border-t border-zinc-200/80 bg-white/55 px-6 py-8 backdrop-blur-md dark:border-white/5 dark:bg-zinc-950/50"
      style={{ opacity }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-zinc-600 sm:flex-row dark:text-zinc-500">
        <p className="text-center sm:text-left">{t('home.story.footer.tagline')}</p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/explore"
            className="text-zinc-600 underline-offset-4 transition hover:text-violet-700 hover:underline dark:text-zinc-400 dark:hover:text-violet-300"
          >
            {t('home.story.footer.explore')}
          </Link>
          <Link
            href="/knowledge"
            className="text-zinc-600 underline-offset-4 transition hover:text-cyan-700 hover:underline dark:text-zinc-400 dark:hover:text-cyan-300"
          >
            {t('home.story.footer.knowledge')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
