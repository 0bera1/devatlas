import type { Edge } from '@xyflow/react';
import type { CSSProperties } from 'react';
import type { AtlasFlowNode } from '@/diagram-engine/core/react-flow.adapter';

function neighborNodeIdsForSelection(
  edges: readonly Edge[],
  selectedNodeId: string,
): ReadonlySet<string> {
  const ids = new Set<string>([selectedNodeId]);
  for (const e of edges) {
    if (e.source === selectedNodeId) {
      ids.add(e.target);
    }
    if (e.target === selectedNodeId) {
      ids.add(e.source);
    }
  }
  return ids;
}

function edgeTouchesSelection(
  edge: Edge,
  selectedNodeId: string | null,
  selectedEdgeId: string | null,
): boolean {
  if (selectedEdgeId !== null && edge.id === selectedEdgeId) {
    return true;
  }
  if (selectedNodeId === null) {
    return false;
  }
  return edge.source === selectedNodeId || edge.target === selectedNodeId;
}

/**
 * Seçili düğüm / kenar için parlaklık ve komşu vurgusu; diğerlerini soluklaştırır.
 */
export function applyAtlasFlowPresentation(
  nodes: readonly AtlasFlowNode[],
  edges: readonly Edge[],
  selectedNodeId: string | null,
  selectedEdgeId: string | null,
): { readonly nodes: AtlasFlowNode[]; readonly edges: Edge[] } {
  if (selectedNodeId === null && selectedEdgeId === null) {
    return { nodes: [...nodes], edges: [...edges] };
  }

  const highlightNodes: ReadonlySet<string> =
    selectedNodeId !== null
      ? neighborNodeIdsForSelection(edges, selectedNodeId)
      : selectedEdgeId !== null
        ? (() => {
            const edge = edges.find((e) => e.id === selectedEdgeId);
            if (edge === undefined) {
              return new Set<string>();
            }
            return new Set<string>([edge.source, edge.target]);
          })()
        : new Set<string>();

  const nextNodes: AtlasFlowNode[] = nodes.map((n) => {
    const isBright: boolean = highlightNodes.has(n.id);
    const isSelected: boolean =
      selectedNodeId !== null && n.id === selectedNodeId;
    const dim: boolean =
      (selectedNodeId !== null || selectedEdgeId !== null) && !isBright;
    const ring: string | undefined = isSelected
      ? '0 0 0 3px rgba(139,92,246,0.55)'
      : undefined;
    return {
      ...n,
      style: {
        ...n.style,
        opacity: dim ? 0.38 : 1,
        boxShadow: ring,
        transition: 'opacity 160ms ease, box-shadow 160ms ease',
      },
    };
  });

  const nextEdges: Edge[] = edges.map((e) => {
    const touches: boolean = edgeTouchesSelection(
      e,
      selectedNodeId,
      selectedEdgeId,
    );
    const isPrimaryEdge: boolean =
      selectedEdgeId !== null && e.id === selectedEdgeId;
    const dim: boolean =
      (selectedNodeId !== null || selectedEdgeId !== null) && !touches;
    const baseStyle: CSSProperties =
      typeof e.style === 'object' && e.style !== null && !Array.isArray(e.style)
        ? { ...(e.style as CSSProperties) }
        : {};
    const strokeW: number =
      typeof baseStyle.strokeWidth === 'number' ? baseStyle.strokeWidth : 2;
    return {
      ...e,
      style: {
        ...baseStyle,
        opacity: dim ? 0.22 : 1,
        strokeWidth: isPrimaryEdge ? 3 : touches ? 2.25 : strokeW,
        transition: 'opacity 160ms ease, stroke-width 160ms ease',
      },
    };
  });

  return { nodes: nextNodes, edges: nextEdges };
}
