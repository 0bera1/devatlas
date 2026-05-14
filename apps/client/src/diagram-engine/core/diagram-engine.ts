import type { Connection, Edge, EdgeChange, NodeChange } from '@xyflow/react';
import type {
  DiagramEdgeKind,
  DiagramRecord,
} from '@/domains/diagramDomains';
import type { DocumentVisibility } from '@/domains/documentsDomains';
import type { DiagramEditorAction } from '@/diagram-engine/core/diagram-editor.reducer';
import type { AtlasFlowNode } from '@/diagram-engine/core/react-flow.adapter';
import type { DiagramEditorStore } from '@/diagram-engine/state/create-diagram-editor-store';
import type { DiagramEdgeSemanticType } from '@/diagram-engine/model/diagram-core.types';
import type {
  DiagramEdgeAppearance,
  DiagramEngineEdge,
  DiagramEngineGraph,
  DiagramEngineNode,
  DiagramStandardNodeData,
} from '@/diagram-engine/types/diagram-engine.types';
import type { StoreApi } from 'zustand/vanilla';

/**
 * UI → Engine → Store zinciri: bileşenler doğrudan reducer aksiyonlarını bilmez.
 */
export class DiagramEngine {
  public constructor(private readonly storeApi: StoreApi<DiagramEditorStore>) {}

  public dispatch(action: DiagramEditorAction): void {
    this.storeApi.getState().dispatch(action);
  }

  public hydrateFromRecord(record: DiagramRecord): void {
    this.dispatch({ type: 'HYDRATE_FROM_RECORD', record });
  }

  public hydrateThenApplyNodeChanges(
    record: DiagramRecord,
    changes: readonly NodeChange<AtlasFlowNode>[],
  ): void {
    this.dispatch({ type: 'HYDRATE_THEN_APPLY_NODE_CHANGES', record, changes });
  }

  public hydrateThenApplyEdgeChanges(
    record: DiagramRecord,
    changes: readonly EdgeChange<Edge>[],
  ): void {
    this.dispatch({ type: 'HYDRATE_THEN_APPLY_EDGE_CHANGES', record, changes });
  }

  public hydrateThenConnect(
    record: DiagramRecord,
    connection: Connection,
  ): void {
    this.dispatch({ type: 'HYDRATE_THEN_CONNECT', record, connection });
  }

  public dehydrate(): void {
    this.dispatch({ type: 'DEHYDRATE' });
  }

  public setVisibilityDraft(visibility: DocumentVisibility): void {
    this.dispatch({ type: 'SET_VISIBILITY_DRAFT', visibility });
  }

  public selectNode(nodeId: string | null): void {
    this.dispatch({ type: 'SELECT_NODE', nodeId });
  }

  public selectEdge(edgeId: string | null): void {
    this.dispatch({ type: 'SELECT_EDGE', edgeId });
  }

  public clearSelection(): void {
    this.dispatch({ type: 'CLEAR_SELECTION' });
  }

  public applyNodeChanges(
    changes: readonly NodeChange<AtlasFlowNode>[],
  ): void {
    this.dispatch({ type: 'APPLY_NODE_CHANGES', changes });
  }

  public applyEdgeChanges(changes: readonly EdgeChange<Edge>[]): void {
    this.dispatch({ type: 'APPLY_EDGE_CHANGES', changes });
  }

  public connect(connection: Connection): void {
    this.dispatch({ type: 'CONNECT', connection });
  }

  public addNode(node: DiagramEngineNode): void {
    this.dispatch({ type: 'ADD_NODE', node });
  }

  public addEngineEdge(edge: DiagramEngineEdge): void {
    this.dispatch({ type: 'ADD_ENGINE_EDGE', edge });
  }

  public deleteNode(nodeId: string): void {
    this.dispatch({ type: 'DELETE_NODE', nodeId });
  }

  public deleteEdge(edgeId: string): void {
    this.dispatch({ type: 'DELETE_EDGE', edgeId });
  }

  public updateNodeData(
    nodeId: string,
    data: Partial<DiagramStandardNodeData>,
  ): void {
    this.dispatch({ type: 'UPDATE_NODE_DATA', nodeId, data });
  }

  public updateEdge(
    edgeId: string,
    patch: Partial<{
      label: string | undefined;
      routing: DiagramEdgeKind;
      appearance: DiagramEdgeAppearance;
      semanticType: DiagramEdgeSemanticType | undefined;
    }>,
  ): void {
    this.dispatch({ type: 'UPDATE_EDGE', edgeId, patch });
  }

  public replaceGraph(graph: DiagramEngineGraph): void {
    this.dispatch({ type: 'REPLACE_GRAPH', graph });
  }

  public remoteNodePosition(nodeId: string, x: number, y: number): void {
    this.dispatch({ type: 'REMOTE_NODE_POSITION', nodeId, x, y });
  }
}
