'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import type { GraphSimulationState } from '@/lib/sceneMath';
import {
  bandNormalized,
  revealStagger,
  INTERVIEW_SCROLL_END,
  INTERVIEW_SCROLL_START,
} from '@/lib/sceneMath';
import type { ReactNode } from 'react';

interface InterviewGlassProps {
  readonly physics: GraphSimulationState;
}

const INTERVIEW_PILLS: readonly MessageKey[] = [
  'home.scene.interview.pill1',
  'home.scene.interview.pill2',
  'home.scene.interview.pill3',
];

const PILL_STAGGER: readonly { readonly start: number; readonly end: number }[] =
  [
    { start: 0.18, end: 0.4 },
    { start: 0.28, end: 0.52 },
    { start: 0.38, end: 0.62 },
  ];

export function InterviewGlass(props: InterviewGlassProps): ReactNode {
  const { physics } = props;
  const { t } = useTranslations();
  const beat: number = physics.beatInterview;
  if (beat < 0.02) {
    return null;
  }

  const timeline: number = bandNormalized(
    physics.scroll,
    INTERVIEW_SCROLL_START,
    INTERVIEW_SCROLL_END,
  );

  const labelReveal: number = revealStagger(timeline, 0.02, 0.16);
  const titleReveal: number = revealStagger(timeline, 0.08, 0.24);
  const subReveal: number = revealStagger(timeline, 0.14, 0.32);

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center px-4"
      style={{ opacity: beat }}
    >
      <div className="max-w-3xl rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-white/90 to-zinc-50/90 px-8 py-10 shadow-[0_28px_90px_-40px_rgba(99,102,241,0.28)] backdrop-blur-2xl dark:border-white/12 dark:from-white/[0.07] dark:to-white/[0.02] dark:shadow-[0_40px_120px_-48px_rgba(99,102,241,0.35)]">
        <p
          className="text-center text-xs font-semibold uppercase tracking-[0.26em] text-violet-700/90 dark:text-violet-300/85"
          style={{
            opacity: labelReveal * beat,
            transform: `translateY(${(1 - labelReveal) * 12}px)`,
          }}
        >
          {t('home.scene.interview.label')}
        </p>
        <h2
          className="mt-2 text-center text-2xl font-semibold text-zinc-900 sm:text-3xl dark:text-zinc-50"
          style={{
            opacity: titleReveal * beat,
            transform: `translateY(${(1 - titleReveal) * 16}px)`,
          }}
        >
          {t('home.scene.interview.title')}
        </h2>
        <p
          className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400"
          style={{
            opacity: subReveal * beat,
            transform: `translateY(${(1 - subReveal) * 12}px)`,
          }}
        >
          {t('home.scene.interview.sub')}
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {INTERVIEW_PILLS.map((pillKey, index) => {
            const windowDef = PILL_STAGGER[index];
            const pillReveal: number =
              windowDef !== undefined
                ? revealStagger(timeline, windowDef.start, windowDef.end)
                : 0;
            return (
              <div
                key={pillKey}
                className="rounded-xl border border-zinc-200/90 bg-white/80 px-3 py-2 text-center text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-black/20 dark:text-zinc-300"
                style={{
                  opacity: pillReveal * beat,
                  transform: `translateY(${(1 - pillReveal) * 18}px)`,
                }}
              >
                {t(pillKey)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
