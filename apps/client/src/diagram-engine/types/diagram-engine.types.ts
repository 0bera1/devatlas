import type { DiagramEdgeKind } from '@/domains/diagramDomains';
import type {
  DiagramEdgeSemanticType,
  DiagramLayoutKind,
  DiagramMode,
  DiagramNodeStatus,
  DiagramNodeType,
} from '@/diagram-engine/model/diagram-core.types';

export type {
  DiagramEdgeSemanticType,
  DiagramLayoutKind,
  DiagramMode,
  DiagramNodeStatus,
  DiagramNodeType,
} from '@/diagram-engine/model/diagram-core.types';

/** @deprecated DiagramMode kullanın */
export type DiagramSemanticType = DiagramMode;

export interface DiagramEngineMetadata {
  readonly version: number;
  readonly mode: DiagramMode;
  readonly layout: DiagramLayoutKind;
  readonly theme?: string;
}

/**
 * React Flow node `data` sözleşmesi — atlas düğümleri (knowledge / flow için genişletilebilir).
 */
export interface DiagramStandardNodeData extends Record<string, unknown> {
  readonly type: DiagramNodeType;
  readonly title: string;
  readonly description?: string;
  readonly markdown?: string;
  readonly tags?: readonly string[];
  readonly status?: DiagramNodeStatus;
  readonly icon?: string;
  readonly color?: string;
  readonly relatedDiagramId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface DiagramEngineNode {
  readonly id: string;
  readonly position: { readonly x: number; readonly y: number };
  readonly width?: number;
  readonly height?: number;
  readonly data: DiagramStandardNodeData;
}

/** Kenar çizim stili (API şimdilik yalnızca `animated` ile kısmen taşır). */
export type DiagramEdgeAppearance = 'default' | 'dashed' | 'animated';

export interface DiagramEngineEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly label?: string;
  readonly appearance: DiagramEdgeAppearance;
  readonly routing: DiagramEdgeKind;
  readonly semanticType?: DiagramEdgeSemanticType;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Editörün tek doğruluk kaynağı — API `DiagramRecord` ile `diagram-record.adapter` üzerinden senkron.
 */
export interface DiagramEngineGraph {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly nodes: readonly DiagramEngineNode[];
  readonly edges: readonly DiagramEngineEdge[];
  readonly metadata: DiagramEngineMetadata;
}
