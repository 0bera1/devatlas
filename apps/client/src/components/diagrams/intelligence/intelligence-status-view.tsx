'use client';

import { IntelligenceEmptyMessage } from '@/components/diagrams/intelligence/intelligence-empty-message';
import { IntelligenceErrorMessage } from '@/components/diagrams/intelligence/intelligence-error-message';
import { IntelligenceResourceBody } from '@/components/diagrams/intelligence/intelligence-resource-body';
import { IntelligenceSkeleton } from '@/components/diagrams/intelligence/intelligence-skeleton';
import type { DiagramIntelligenceState } from '@/hooks/use-diagram-intelligence';
import type { ReactNode } from 'react';

export interface IntelligenceStatusViewProps {
  readonly state: DiagramIntelligenceState;
}

export function IntelligenceStatusView(
  props: IntelligenceStatusViewProps,
): ReactNode {
  const { state } = props;

  switch (state.status) {
    case 'loading':
      return <IntelligenceSkeleton />;
    case 'error':
      return (
        <IntelligenceErrorMessage message={state.errorMessage ?? ''} />
      );
    case 'empty':
      return <IntelligenceEmptyMessage />;
    case 'ready':
      return state.resource === null ? null : (
        <IntelligenceResourceBody resource={state.resource} />
      );
    default: {
      const _exhaustive: never = state.status;
      return _exhaustive;
    }
  }
}
