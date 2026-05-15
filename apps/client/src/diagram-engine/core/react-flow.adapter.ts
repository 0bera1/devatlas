import {
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  Position,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import {
  parseDiagramEdgeRouting,
  parseDiagramEdgeSemanticType,
} from '@/diagram-engine/edges/diagram-edge.constants';
import {
  ATLAS_NODE_DEFAULT_HEIGHT,
  ATLAS_NODE_DEFAULT_WIDTH,
  parseDiagramNodeType,
} from '@/diagram-engine/nodes/atlas-node.constants';
import type { DiagramEdgeSemanticType } from '@/diagram-engine/model/diagram-core.types';
import type { DiagramNodeType } from '@/diagram-engine/model/diagram-core.types';
import type {
  DiagramEdgeAppearance,
  DiagramEngineEdge,
  DiagramEngineGraph,
  DiagramEngineNode,
  DiagramStandardNodeData,
} from '@/diagram-engine/types/diagram-engine.types';

export type AtlasFlowNode = Node<DiagramStandardNodeData, DiagramNodeType>;

/** Kenar `data` — XYFlow ile motor `semanticType` arasında taşınır. */
export const ATLAS_FLOW_EDGE_SEMANTIC_KEY = 'atlasSemantic' as const;

/** Kenar etiketi — SVG yerine `EdgeLabelRenderer` katmanında gösterilir. */
export const ATLAS_FLOW_EDGE_LABEL_KEY = 'atlasEdgeLabel' as const;

/** Handle kutusu — `<Handle />` ile aynı; XYFlow kenar geometrisi için gerekli. */
const ATLAS_FLOW_HANDLE_PX = 12;

/**
 * DOM ölçümü / ResizeObserver gecikse bile `isNodeInitialized` ve kenar uçları doğru kalsın.
 * @see https://github.com/xyflow/xyflow — NodeBase `handles`
 */
function buildAtlasNodeHandles(
  width: number,
  height: number,
): NonNullable<AtlasFlowNode['handles']> {
  const h: number = ATLAS_FLOW_HANDLE_PX;
  const yCenter: number = Math.max(0, (height - h) / 2);
  return [
    {
      type: 'target' as const,
      position: Position.Left,
      x: 0,
      y: yCenter,
      width: h,
      height: h,
    },
    {
      type: 'source' as const,
      position: Position.Right,
      x: Math.max(0, width - h),
      y: yCenter,
      width: h,
      height: h,
    },
  ];
}

function readFlowMeasuredDimensions(
  node: AtlasFlowNode,
): { readonly width: number; readonly height: number } | null {
  if (!('measured' in node) || node.measured === undefined) {
    return null;
  }
  const measured = node.measured as { width?: number; height?: number };
  const w: number | undefined = measured.width;
  const h: number | undefined = measured.height;
  if (
    typeof w !== 'number' ||
    Number.isNaN(w) ||
    typeof h !== 'number' ||
    Number.isNaN(h)
  ) {
    return null;
  }
  return { width: w, height: h };
}

/** Kenar okları — renk/boyut olmadan XYFlow 12’de marker bazen görünmez. */
export const ATLAS_EDGE_MARKER_END = {
  type: MarkerType.ArrowClosed,
  width: 16,
  height: 16,
  color: '#52525b',
} as const;

export const ATLAS_DEFAULT_EDGE_OPTIONS = {
  markerEnd: ATLAS_EDGE_MARKER_END,
  style: { stroke: '#71717a', strokeWidth: 2 },
} as const;

function readEdgeAppearance(edge: Edge): DiagramEdgeAppearance {
  if (edge.animated === true) {
    return 'animated';
  }
  const style = edge.style;
  if (
    style !== undefined &&
    typeof style === 'object' &&
    !Array.isArray(style) &&
    'strokeDasharray' in style &&
    Boolean((style as { strokeDasharray?: string }).strokeDasharray)
  ) {
    return 'dashed';
  }
  return 'default';
}

function atlasSemanticRfEdgeClass(
  semantic: DiagramEdgeSemanticType | undefined,
): string | undefined {
  if (semantic === undefined || semantic === 'default') {
    return undefined;
  }
  switch (semantic) {
    case 'data-flow':
      return 'atlas-edge-semantic-data-flow';
    case 'dependency':
      return 'atlas-edge-semantic-dependency';
    case 'async':
      return 'atlas-edge-semantic-async';
    case 'dashed':
      return 'atlas-edge-semantic-dashed';
    default: {
      const _e: never = semantic;
      return _e;
    }
  }
}

function mergeSemanticStroke(
  semantic: DiagramEdgeSemanticType | undefined,
  base: { readonly stroke: string; readonly strokeWidth: number },
): { readonly stroke: string; readonly strokeWidth: number } {
  if (semantic === undefined || semantic === 'default') {
    return base;
  }
  switch (semantic) {
    case 'data-flow':
      return { stroke: '#7c3aed', strokeWidth: Math.max(base.strokeWidth, 2.5) };
    case 'dependency':
      return { stroke: '#0ea5e9', strokeWidth: base.strokeWidth };
    case 'async':
      return { stroke: '#a855f7', strokeWidth: base.strokeWidth };
    case 'dashed':
      return { stroke: base.stroke, strokeWidth: base.strokeWidth };
    default: {
      const _e: never = semantic;
      return _e;
    }
  }
}

export function engineNodeToFlowNode(node: DiagramEngineNode): AtlasFlowNode {
  const width: number = node.width ?? ATLAS_NODE_DEFAULT_WIDTH;
  const height: number = node.height ?? ATLAS_NODE_DEFAULT_HEIGHT;
  const nodeType: DiagramNodeType = parseDiagramNodeType(String(node.data.type));
  return {
    id: node.id,
    type: nodeType,
    position: { x: node.position.x, y: node.position.y },
    width,
    height,
    handles: buildAtlasNodeHandles(width, height),
    data: {
      title: node.data.title,
      description: node.data.description,
      markdown: node.data.markdown,
      tags: node.data.tags,
      status: node.data.status,
      icon: node.data.icon,
      color: node.data.color,
      relatedDiagramId: node.data.relatedDiagramId,
      metadata: node.data.metadata,
      type: nodeType,
    },
  };
}

export function flowNodeToEngineNode(node: AtlasFlowNode): DiagramEngineNode {
  const measured: { readonly width: number; readonly height: number } | null =
    readFlowMeasuredDimensions(node);
  const width: number | undefined =
    typeof node.width === 'number' && !Number.isNaN(node.width)
      ? node.width
      : measured?.width;
  const height: number | undefined =
    typeof node.height === 'number' && !Number.isNaN(node.height)
      ? node.height
      : measured?.height;
  const nodeType: DiagramNodeType = parseDiagramNodeType(String(node.data.type));
  return {
    id: node.id,
    position: { x: node.position.x, y: node.position.y },
    width,
    height,
    data: {
      title: node.data.title,
      description: node.data.description,
      markdown: node.data.markdown,
      tags: node.data.tags,
      status: node.data.status,
      icon: node.data.icon,
      color: node.data.color,
      relatedDiagramId: node.data.relatedDiagramId,
      metadata: node.data.metadata,
      type: nodeType,
    },
  };
}

export function engineEdgeToFlowEdge(edge: DiagramEngineEdge): Edge {
  const baseStroke = mergeSemanticStroke(edge.semanticType, {
    stroke: '#71717a',
    strokeWidth: 2,
  });
  const useDash: boolean =
    edge.appearance === 'dashed' || edge.semanticType === 'dependency';
  const flowData: Record<string, unknown> = {};
  if (edge.semanticType !== undefined && edge.semanticType !== 'default') {
    flowData[ATLAS_FLOW_EDGE_SEMANTIC_KEY] = edge.semanticType;
  }
  if (edge.label !== undefined && edge.label.trim().length > 0) {
    flowData[ATLAS_FLOW_EDGE_LABEL_KEY] = edge.label;
  }
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.routing,
    animated:
      edge.appearance === 'animated' || edge.semanticType === 'data-flow',
    markerEnd: { ...ATLAS_EDGE_MARKER_END },
    style: {
      ...baseStroke,
      ...(useDash ? { strokeDasharray: '6 4' } : {}),
    },
    className: atlasSemanticRfEdgeClass(edge.semanticType),
    data: Object.keys(flowData).length > 0 ? flowData : undefined,
  };
}

export function flowEdgeToEngineEdge(edge: Edge): DiagramEngineEdge {
  const routing = parseDiagramEdgeRouting(
    typeof edge.type === 'string' ? edge.type : undefined,
  );
  const appearance: DiagramEdgeAppearance = readEdgeAppearance(edge);
  const rawData: unknown = edge.data;
  let semanticFromFlow: DiagramEdgeSemanticType | undefined;
  if (
    rawData !== undefined &&
    typeof rawData === 'object' &&
    rawData !== null &&
    ATLAS_FLOW_EDGE_SEMANTIC_KEY in rawData
  ) {
    semanticFromFlow = parseDiagramEdgeSemanticType(
      (rawData as Record<string, unknown>)[ATLAS_FLOW_EDGE_SEMANTIC_KEY],
    );
  }
  const dataRecord: Record<string, unknown> | null =
    rawData !== undefined &&
    typeof rawData === 'object' &&
    rawData !== null &&
    !Array.isArray(rawData)
      ? (rawData as Record<string, unknown>)
      : null;
  const labelFromData: unknown = dataRecord?.[ATLAS_FLOW_EDGE_LABEL_KEY];
  const labelRaw: unknown = edge.label ?? labelFromData;
  const resolvedLabel: string | undefined =
    labelRaw === undefined || labelRaw === null
      ? undefined
      : String(labelRaw).trim().length === 0
        ? undefined
        : String(labelRaw).trim();

  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: resolvedLabel,
    routing,
    appearance,
    semanticType:
      semanticFromFlow === undefined || semanticFromFlow === 'default'
        ? undefined
        : semanticFromFlow,
  };
}

export function engineGraphToFlowNodes(
  graph: DiagramEngineGraph,
): AtlasFlowNode[] {
  return graph.nodes.map(engineNodeToFlowNode);
}

export function engineGraphToFlowEdges(graph: DiagramEngineGraph): Edge[] {
  return graph.edges.map(engineEdgeToFlowEdge);
}

export function applyNodeChangesToEngineGraph(
  graph: DiagramEngineGraph,
  changes: readonly NodeChange<AtlasFlowNode>[],
): DiagramEngineGraph {
  const flowNodes: AtlasFlowNode[] = engineGraphToFlowNodes(graph);
  const nextFlow: AtlasFlowNode[] = applyNodeChanges(
    [...changes],
    flowNodes,
  ) as AtlasFlowNode[];
  return {
    ...graph,
    nodes: nextFlow.map(flowNodeToEngineNode),
  };
}

export function applyEdgeChangesToEngineGraph(
  graph: DiagramEngineGraph,
  changes: readonly EdgeChange<Edge>[],
): DiagramEngineGraph {
  const flowEdges: Edge[] = engineGraphToFlowEdges(graph);
  const nextFlow: Edge[] = applyEdgeChanges([...changes], flowEdges);
  return {
    ...graph,
    edges: nextFlow.map(flowEdgeToEngineEdge),
  };
}
