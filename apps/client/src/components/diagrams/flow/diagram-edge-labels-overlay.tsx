'use client';

import {
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  Position,
  useStore,
  type Edge,
} from '@xyflow/react';
import { DiagramEdgeLabelBadge } from '@/components/diagrams/flow/diagram-edge-label-badge';
import {
  ATLAS_FLOW_EDGE_LABEL_KEY,
  ATLAS_FLOW_EDGE_SEMANTIC_KEY,
} from '@/diagram-engine/core/react-flow.adapter';
import {
  parseDiagramEdgeRouting,
  parseDiagramEdgeSemanticType,
} from '@/diagram-engine/edges/diagram-edge.constants';
import type { DiagramEdgeSemanticType } from '@/diagram-engine/model/diagram-core.types';
import {
  ATLAS_NODE_DEFAULT_HEIGHT,
  ATLAS_NODE_DEFAULT_WIDTH,
} from '@/diagram-engine/nodes/atlas-node.constants';
import type { DiagramEdgeKind } from '@/domains/diagram/diagramDomains';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

interface EdgeLabelPlacement {
  readonly edgeId: string;
  readonly label: string;
  readonly semantic: DiagramEdgeSemanticType;
  readonly x: number;
  readonly y: number;
  readonly dimmed: boolean;
}

interface DiagramEdgeLabelsOverlayProps {
  readonly edges: readonly Edge[];
}

interface PathEndpoints {
  readonly sourceX: number;
  readonly sourceY: number;
  readonly targetX: number;
  readonly targetY: number;
  readonly sourcePosition: Position;
  readonly targetPosition: Position;
}

function readEdgeLabel(edge: Edge): string | null {
  const data: unknown = edge.data;
  let fromData: unknown;
  if (data !== undefined && typeof data === 'object' && data !== null) {
    fromData = (data as Record<string, unknown>)[ATLAS_FLOW_EDGE_LABEL_KEY];
  }
  const raw: unknown = edge.label ?? fromData;
  if (raw === undefined || raw === null) {
    return null;
  }
  const trimmed: string = String(raw).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readEdgeSemantic(edge: Edge): DiagramEdgeSemanticType {
  const data: unknown = edge.data;
  if (data !== undefined && typeof data === 'object' && data !== null) {
    const parsed: DiagramEdgeSemanticType | undefined =
      parseDiagramEdgeSemanticType(
        (data as Record<string, unknown>)[ATLAS_FLOW_EDGE_SEMANTIC_KEY],
      );
    if (parsed !== undefined) {
      return parsed;
    }
  }
  return 'default';
}

function resolvePathEndpoints(
  sourceX: number,
  sourceY: number,
  sourceW: number,
  sourceH: number,
  targetX: number,
  targetY: number,
  targetW: number,
  targetH: number,
): PathEndpoints {
  return {
    sourceX: sourceX + sourceW,
    sourceY: sourceY + sourceH / 2,
    targetX,
    targetY: targetY + targetH / 2,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };
}

function resolveLabelCenter(
  routing: DiagramEdgeKind,
  params: PathEndpoints,
): { readonly x: number; readonly y: number } | null {
  switch (routing) {
    case 'straight': {
      const [, labelX, labelY] = getStraightPath(params);
      return { x: labelX, y: labelY };
    }
    case 'smoothstep':
    case 'step': {
      const [, labelX, labelY] = getSmoothStepPath(params);
      return { x: labelX, y: labelY };
    }
    case 'default': {
      const [, labelX, labelY] = getBezierPath({ ...params, curvature: 0.25 });
      return { x: labelX, y: labelY };
    }
  }
}

export function DiagramEdgeLabelsOverlay(
  props: DiagramEdgeLabelsOverlayProps,
): ReactNode {
  const { edges } = props;
  const nodeLookup = useStore((state) => state.nodeLookup);

  const placements: EdgeLabelPlacement[] = useMemo(() => {
    const result: EdgeLabelPlacement[] = [];
    for (const edge of edges) {
      const label: string | null = readEdgeLabel(edge);
      if (label === null) {
        continue;
      }
      const source = nodeLookup.get(edge.source);
      const target = nodeLookup.get(edge.target);
      if (source === undefined || target === undefined) {
        continue;
      }
      const sourceAbs = source.internals.positionAbsolute;
      const targetAbs = target.internals.positionAbsolute;
      const sourceW: number =
        source.measured.width ?? source.width ?? ATLAS_NODE_DEFAULT_WIDTH;
      const sourceH: number =
        source.measured.height ?? source.height ?? ATLAS_NODE_DEFAULT_HEIGHT;
      const targetW: number =
        target.measured.width ?? target.width ?? ATLAS_NODE_DEFAULT_WIDTH;
      const targetH: number =
        target.measured.height ?? target.height ?? ATLAS_NODE_DEFAULT_HEIGHT;
      const params: PathEndpoints = resolvePathEndpoints(
        sourceAbs.x,
        sourceAbs.y,
        sourceW,
        sourceH,
        targetAbs.x,
        targetAbs.y,
        targetW,
        targetH,
      );
      const routing: DiagramEdgeKind = parseDiagramEdgeRouting(
        typeof edge.type === 'string' ? edge.type : undefined,
      );
      const center = resolveLabelCenter(routing, params);
      if (center === null) {
        continue;
      }
      const style =
        typeof edge.style === 'object' &&
        edge.style !== null &&
        !Array.isArray(edge.style)
          ? (edge.style as { opacity?: number })
          : undefined;
      const dimmed: boolean =
        typeof style?.opacity === 'number' && style.opacity < 0.5;
      result.push({
        edgeId: edge.id,
        label,
        semantic: readEdgeSemantic(edge),
        x: center.x,
        y: center.y,
        dimmed,
      });
    }
    return result;
  }, [edges, nodeLookup]);

  if (placements.length === 0) {
    return null;
  }

  return (
    <EdgeLabelRenderer>
      {placements.map((placement: EdgeLabelPlacement) => (
        <div
          key={placement.edgeId}
          className="atlas-edge-label-html pointer-events-none nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${placement.x}px, ${placement.y}px)`,
            zIndex: 1000,
            opacity: placement.dimmed ? 0.35 : 1,
            transition: 'opacity 160ms ease',
          }}
        >
          <DiagramEdgeLabelBadge
            label={placement.label}
            semantic={placement.semantic}
            dimmed={placement.dimmed}
          />
        </div>
      ))}
    </EdgeLabelRenderer>
  );
}
