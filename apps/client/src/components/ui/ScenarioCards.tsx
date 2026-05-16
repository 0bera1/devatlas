'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { GraphSimulationState } from '@/lib/sceneMath';
import {
  bandNormalized,
  revealStagger,
  SCENARIO_SCROLL_END,
  SCENARIO_SCROLL_START,
} from '@/lib/sceneMath';
import type { MessageKey } from '@/i18n';
import type { ReactNode } from 'react';

interface ScenarioCardsProps {
  readonly physics: GraphSimulationState;
}

interface ScenarioCardDef {
  readonly titleKey: MessageKey;
  readonly bodyKey: MessageKey;
}

const SCENARIO_CARDS: readonly ScenarioCardDef[] = [
  {
    titleKey: 'home.scene.card1.title',
    bodyKey: 'home.scene.card1.body',
  },
  {
    titleKey: 'home.scene.card2.title',
    bodyKey: 'home.scene.card2.body',
  },
  {
    titleKey: 'home.scene.card3.title',
    bodyKey: 'home.scene.card3.body',
  },
];

const CARD_STAGGER: readonly { readonly start: number; readonly end: number }[] =
  [
    { start: 0.14, end: 0.4 },
    { start: 0.24, end: 0.52 },
    { start: 0.34, end: 0.62 },
  ];

export function ScenarioCards(props: ScenarioCardsProps): ReactNode {
  const { physics } = props;
  const { t } = useTranslations();
  const beat: number = physics.beatScenario;
  if (beat < 0.02) {
    return null;
  }

  const timeline: number = bandNormalized(
    physics.scroll,
    SCENARIO_SCROLL_START,
    SCENARIO_SCROLL_END,
  );

  const labelReveal: number = revealStagger(timeline, 0.02, 0.16);
  const titleReveal: number = revealStagger(timeline, 0.08, 0.24);
  const slidePx: number = (1 - revealStagger(timeline, 0.12, 0.42)) * 36;

  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4"
      style={{ opacity: beat }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-700/90 dark:text-violet-300/80"
        style={{
          opacity: labelReveal * beat,
          transform: `translateY(${(1 - labelReveal) * 14}px)`,
        }}
      >
        {t('home.scene.scenario.title')}
      </p>
      <h2
        className="mt-2 max-w-3xl text-center text-2xl font-semibold text-zinc-900 sm:text-3xl dark:text-zinc-50"
        style={{
          opacity: titleReveal * beat,
          transform: `translateY(${(1 - titleReveal) * 18}px)`,
        }}
      >
        {t('home.scene.scenario.sub')}
      </h2>
      <div
        className="mt-10 flex w-full max-w-5xl flex-col justify-center gap-4 sm:flex-row sm:gap-6"
        style={{
          transform: `translateX(${slidePx}px)`,
        }}
      >
        {SCENARIO_CARDS.map((card, index) => {
          const windowDef = CARD_STAGGER[index];
          const cardReveal: number =
            windowDef !== undefined
              ? revealStagger(timeline, windowDef.start, windowDef.end)
              : 0;
          return (
            <div
              key={card.titleKey}
              className="flex-1 rounded-2xl border border-zinc-200/90 bg-white/70 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              style={{
                opacity: cardReveal * beat,
                transform: `translateY(${(1 - cardReveal) * 22}px) scale(${0.96 + cardReveal * 0.04})`,
              }}
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {t(card.titleKey)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {t(card.bodyKey)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
