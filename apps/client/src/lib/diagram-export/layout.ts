import dagre from '@dagrejs/dagre';

export interface LayoutNodeInput {
  readonly id: string;
  readonly width?: number;
  readonly height?: number;
}

export interface LayoutEdgeInput {
  readonly source: string;
  readonly target: string;
}

export interface LayoutPosition {
  readonly x: number;
  readonly y: number;
}

export interface LayoutOptions {
  /** Soldan sağa (LR) ya da yukarıdan aşağıya (TB). */
  readonly direction?: 'LR' | 'TB';
  readonly nodeSep?: number;
  readonly rankSep?: number;
}

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 96;

/**
 * Düğümleri hiyerarşik olarak yerleştirir (dagre). Dönen konumlar sol üst köşeyi gösterir,
 * böylece React Flow'un `position` değeri olarak doğrudan kullanılabilir.
 */
export function computeHierarchicalLayout(
  nodes: readonly LayoutNodeInput[],
  edges: readonly LayoutEdgeInput[],
  options: LayoutOptions = {},
): Map<string, LayoutPosition> {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    rankdir: options.direction ?? 'LR',
    nodesep: options.nodeSep ?? 60,
    ranksep: options.rankSep ?? 110,
    marginx: 24,
    marginy: 24,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    graph.setNode(node.id, {
      width: node.width ?? DEFAULT_NODE_WIDTH,
      height: node.height ?? DEFAULT_NODE_HEIGHT,
    });
  }
  for (const edge of edges) {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(graph);

  const positions = new Map<string, LayoutPosition>();
  for (const node of nodes) {
    const placed = graph.node(node.id) as { x: number; y: number; width: number; height: number } | undefined;
    if (placed === undefined) {
      continue;
    }
    positions.set(node.id, {
      x: placed.x - placed.width / 2,
      y: placed.y - placed.height / 2,
    });
  }
  return positions;
}
