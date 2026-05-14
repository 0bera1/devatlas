'use client';

import { useDiagramEditorStore } from '@/diagram-engine/state/diagram-editor-store.context';
import type {
  DiagramEngineEdge,
  DiagramEngineNode,
} from '@/diagram-engine/types/diagram-engine.types';

export function useSelectedEngineNode(): DiagramEngineNode | undefined {
  return useDiagramEditorStore((s) => {
    if (s.selectedNodeId === null) {
      return undefined;
    }
    return s.graph.nodes.find((n) => n.id === s.selectedNodeId);
  });
}

export function useSelectedEngineEdge(): DiagramEngineEdge | undefined {
  return useDiagramEditorStore((s) => {
    if (s.selectedEdgeId === null) {
      return undefined;
    }
    return s.graph.edges.find((e) => e.id === s.selectedEdgeId);
  });
}

export function useHoveredEngineNode(): DiagramEngineNode | undefined {
  return useDiagramEditorStore((s) => {
    if (s.hoverNodeId === null) {
      return undefined;
    }
    return s.graph.nodes.find((n) => n.id === s.hoverNodeId);
  });
}
