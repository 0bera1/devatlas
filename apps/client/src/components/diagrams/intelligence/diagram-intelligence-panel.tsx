'use client';

import { IntelligencePanelHeader } from '@/components/diagrams/intelligence/intelligence-panel-header';
import { IntelligenceStatusView } from '@/components/diagrams/intelligence/intelligence-status-view';
import {
  useDiagramIntelligence,
  type DiagramIntelligenceState,
} from '@/hooks/use-diagram-intelligence';
import type { ReactNode } from 'react';

export interface DiagramIntelligencePanelProps {
  readonly diagramId: string;
  readonly enabled: boolean;
}

export function DiagramIntelligencePanel(
  props: DiagramIntelligencePanelProps,
): ReactNode {
  const { diagramId, enabled } = props;
  const state: DiagramIntelligenceState = useDiagramIntelligence(
    diagramId,
    enabled,
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
      <IntelligencePanelHeader />
      <IntelligenceStatusView state={state} />
    </section>
  );
}
