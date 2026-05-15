'use client';

import type { DiagramEdgeSemanticType } from '@/diagram-engine/model/diagram-core.types';
import type { ReactNode } from 'react';

interface DiagramEdgeLabelBadgeProps {
  readonly label: string;
  readonly semantic: DiagramEdgeSemanticType;
  readonly dimmed: boolean;
}

function resolveSemanticVariantClass(
  semantic: DiagramEdgeSemanticType,
): string {
  switch (semantic) {
    case 'data-flow':
      return 'atlas-edge-label-badge--data-flow';
    case 'dependency':
      return 'atlas-edge-label-badge--dependency';
    case 'async':
      return 'atlas-edge-label-badge--async';
    case 'dashed':
      return 'atlas-edge-label-badge--dashed';
    case 'default':
      return 'atlas-edge-label-badge--default';
  }
}

export function DiagramEdgeLabelBadge(
  props: DiagramEdgeLabelBadgeProps,
): ReactNode {
  const { label, semantic, dimmed } = props;
  const variantClass: string = resolveSemanticVariantClass(semantic);
  const activeClass: string = dimmed ? '' : 'atlas-edge-label-badge--live';

  return (
    <span className="atlas-edge-label-badge-shell" title={label}>
      <span
        className={`atlas-edge-label-badge ${variantClass} ${activeClass}`.trim()}
      >
        {label}
      </span>
    </span>
  );
}
