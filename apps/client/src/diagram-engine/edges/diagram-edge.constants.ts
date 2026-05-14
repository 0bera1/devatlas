import type { DiagramEdgeKind } from '@/domains/diagramDomains';
import type { DiagramEdgeSemanticType } from '@/diagram-engine/model/diagram-core.types';
import type { DiagramEdgeAppearance } from '@/diagram-engine/types/diagram-engine.types';

export const DEFAULT_EDGE_ROUTING: DiagramEdgeKind = 'smoothstep';

export function parseDiagramEdgeRouting(
  raw: string | null | undefined,
): DiagramEdgeKind {
  switch (raw) {
    case 'straight':
    case 'step':
    case 'default':
    case 'smoothstep':
      return raw;
    default:
      return DEFAULT_EDGE_ROUTING;
  }
}

export function mapRecordAnimatedToAppearance(
  animated: boolean,
): DiagramEdgeAppearance {
  return animated ? 'animated' : 'default';
}

const DIAGRAM_EDGE_SEMANTIC_TYPES: readonly DiagramEdgeSemanticType[] = [
  'default',
  'dashed',
  'data-flow',
  'dependency',
  'async',
] as const;

const SEMANTIC_LOOKUP: ReadonlySet<string> = new Set<string>(
  DIAGRAM_EDGE_SEMANTIC_TYPES,
);

export function parseDiagramEdgeSemanticType(
  raw: unknown,
): DiagramEdgeSemanticType | undefined {
  if (typeof raw !== 'string') {
    return undefined;
  }
  if (!SEMANTIC_LOOKUP.has(raw)) {
    return undefined;
  }
  return raw as DiagramEdgeSemanticType;
}