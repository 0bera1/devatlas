'use client';

import { LandingMiniAtlasFlow } from '@/components/canvas/landing-mini-atlas-flow';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { GraphSimulationState } from '@/lib/sceneMath';
import {
  bandNormalized,
  revealStagger,
  FLOW_SCROLL_END,
  FLOW_SCROLL_START,
} from '@/lib/sceneMath';
import type { ReactNode } from 'react';

interface FlowTableProps {
  readonly physics: GraphSimulationState;
}

export function FlowTable(props: FlowTableProps): ReactNode {
  const { physics } = props;
  const { t } = useTranslations();
  const beat: number = physics.beatFlow;
  if (beat < 0.02) {
    return null;
  }

  const flowTimeline: number = bandNormalized(
    physics.scroll,
    FLOW_SCROLL_START,
    FLOW_SCROLL_END,
  );

  const titleReveal: number = revealStagger(flowTimeline, 0, 0.18);
  const subReveal: number = revealStagger(flowTimeline, 0.08, 0.26);
  const panelReveal: number = revealStagger(flowTimeline, 0.12, 0.32);

  const graphPulse: number =
    physics.activity * 0.2 +
    physics.interactionBoost * 0.22 +
    physics.flowEmphasis * 0.12 +
    physics.density * 0.06;

  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 pt-12 md:pt-20"
      style={{ opacity: beat }}
    >
      <div className="pointer-events-auto mb-4 max-w-2xl text-center">
        <h2
          className="text-2xl font-semibold text-zinc-900 sm:text-3xl dark:text-zinc-50"
          style={{
            opacity: titleReveal * beat,
            transform: `translateY(${(1 - titleReveal) * 16}px)`,
          }}
        >
          {t('home.scene.flow.title')}
        </h2>
        <p
          className="mt-2 text-sm text-zinc-600 sm:text-base dark:text-zinc-400"
          style={{
            opacity: subReveal * beat,
            transform: `translateY(${(1 - subReveal) * 12}px)`,
          }}
        >
          {t('home.scene.flow.sub')}
        </p>
      </div>
      <div
        className="w-full max-w-3xl"
        style={{
          opacity: panelReveal * beat,
          transform: `translateY(${(1 - panelReveal) * 20}px)`,
        }}
      >
        <LandingMiniAtlasFlow
          visible={panelReveal * beat}
          graphPulse={graphPulse}
          flowTimeline={flowTimeline}
        />
      </div>
    </div>
  );
}
