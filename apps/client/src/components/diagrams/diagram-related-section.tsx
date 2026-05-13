'use client';

import { DiagramIntelligencePanel } from '@/components/diagrams/intelligence/diagram-intelligence-panel';
import type { ReactNode } from 'react';

export interface DiagramRelatedSectionProps {
  readonly diagramId: string;
  readonly enabled: boolean;
}

/**
 * Diagram detay görünümünün sağ panelindeki "Related Resources" bölmesi.
 * Tüm görsel parçalar `intelligence/` altındaki bileşenlere ayrılmıştır.
 */
export function DiagramRelatedSection(
  props: DiagramRelatedSectionProps,
): ReactNode {
  const { diagramId, enabled } = props;
  return <DiagramIntelligencePanel diagramId={diagramId} enabled={enabled} />;
}
