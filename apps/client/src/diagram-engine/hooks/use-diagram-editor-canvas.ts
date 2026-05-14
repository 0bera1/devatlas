'use client';

import { useCallback, useMemo } from 'react';
import type {
  Connection,
  Edge,
  EdgeChange,
  NodeChange,
  Viewport,
} from '@xyflow/react';
import {
  engineGraphToFlowEdges,
  engineGraphToFlowNodes,
  type AtlasFlowNode,
} from '@/diagram-engine/core/react-flow.adapter';
import type { DiagramEditorAction } from '@/diagram-engine/core/diagram-editor.reducer';
import {
  useDiagramEditorDispatch,
  useDiagramEditorState,
  useDiagramEditorStore,
} from '@/diagram-engine/hooks/diagram-editor-store';
import type {
  DiagramEditorCanvasMode,
  DiagramEditorViewportState,
} from '@/diagram-engine/state/diagram-editor.store.types';
import type { DiagramEngineGraph } from '@/diagram-engine/types/diagram-engine.types';
import type { DocumentVisibility } from '@/domains/documentsDomains';
import type { Dispatch } from 'react';

export interface UseDiagramEditorCanvasResult {
  readonly graph: DiagramEngineGraph;
  readonly hydrated: boolean;
  readonly selectedNodeId: string | null;
  readonly selectedEdgeId: string | null;
  readonly visibilityDraft: DocumentVisibility;
  readonly viewport: DiagramEditorViewportState;
  readonly hoverNodeId: string | null;
  readonly editorCanvasMode: DiagramEditorCanvasMode;
  readonly flowNodes: AtlasFlowNode[];
  readonly flowEdges: Edge[];
  readonly onNodesChange: (
    changes: readonly NodeChange<AtlasFlowNode>[],
  ) => void;
  readonly onEdgesChange: (changes: readonly EdgeChange<Edge>[]) => void;
  readonly onConnect: (connection: Connection) => void;
  readonly onViewportMoveEnd: (
    _event: MouseEvent | TouchEvent | null,
    viewport: Viewport,
  ) => void;
  readonly dispatch: Dispatch<DiagramEditorAction>;
}

export function useDiagramEditorCanvas(): UseDiagramEditorCanvasResult {
  const {
    graph,
    hydrated,
    selectedNodeId,
    selectedEdgeId,
    visibilityDraft,
    viewport,
    hoverNodeId,
    editorCanvasMode,
  } = useDiagramEditorState();
  const dispatch: Dispatch<DiagramEditorAction> = useDiagramEditorDispatch();
  const setViewport = useDiagramEditorStore((s) => s.setViewport);

  const flowNodes: AtlasFlowNode[] = useMemo(
    (): AtlasFlowNode[] => engineGraphToFlowNodes(graph),
    [graph],
  );

  const flowEdges: Edge[] = useMemo(
    (): Edge[] => engineGraphToFlowEdges(graph),
    [graph],
  );

  const onNodesChange: UseDiagramEditorCanvasResult['onNodesChange'] =
    useCallback(
      (changes: readonly NodeChange<AtlasFlowNode>[]): void => {
        dispatch({ type: 'APPLY_NODE_CHANGES', changes });
      },
      [dispatch],
    );

  const onEdgesChange: UseDiagramEditorCanvasResult['onEdgesChange'] =
    useCallback(
      (changes: readonly EdgeChange<Edge>[]): void => {
        dispatch({ type: 'APPLY_EDGE_CHANGES', changes });
      },
      [dispatch],
    );

  const onConnect: UseDiagramEditorCanvasResult['onConnect'] = useCallback(
    (connection: Connection): void => {
      dispatch({ type: 'CONNECT', connection });
    },
    [dispatch],
  );

  const onViewportMoveEnd: UseDiagramEditorCanvasResult['onViewportMoveEnd'] =
    useCallback(
      (
        _event: MouseEvent | TouchEvent | null,
        next: Viewport,
      ): void => {
        setViewport(next);
      },
      [setViewport],
    );

  return {
    graph,
    hydrated,
    selectedNodeId,
    selectedEdgeId,
    visibilityDraft,
    viewport,
    hoverNodeId,
    editorCanvasMode,
    flowNodes,
    flowEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onViewportMoveEnd,
    dispatch,
  };
}
