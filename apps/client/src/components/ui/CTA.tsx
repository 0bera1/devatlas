'use client';

import Link from 'next/link';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { GraphSimulationState } from '@/lib/sceneMath';
import { useSceneStore } from '@/store/useSceneStore';
import type { ReactNode } from 'react';

interface CTAProps {
  readonly physics: GraphSimulationState;
}

export function CTA(props: CTAProps): ReactNode {
  const { physics } = props;
  const { t } = useTranslations();
  const setInteractionBoost = useSceneStore(
    (state) => state.setInteractionBoost,
  );
  const beat: number = physics.beatCta;
  if (beat < 0.02) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 flex min-h-[55vh] flex-col items-center justify-center px-6 py-10"
      style={{ opacity: beat }}
    >
      <div className="pointer-events-auto mx-auto flex w-full max-w-2xl flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl dark:text-zinc-50">
          {t('home.story.cta.title')}
        </h2>
        <Link
          href="/register"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-10 py-3.5 text-sm font-semibold text-white shadow-[0_0_36px_-6px_rgba(139,92,246,0.45)] transition hover:shadow-[0_0_44px_-4px_rgba(34,211,238,0.45)] dark:shadow-[0_0_44px_-8px_rgba(139,92,246,0.65)] dark:hover:shadow-[0_0_52px_-4px_rgba(34,211,238,0.55)]"
          onPointerEnter={() => {
            setInteractionBoost(1);
          }}
          onPointerLeave={() => {
            setInteractionBoost(0);
          }}
        >
          {t('home.story.cta.button')}
        </Link>
      </div>
    </div>
  );
}
