import {
  addEdge,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react';
import type {
  DiagramEdgeKind,
  DiagramRecord,
} from '@/domains/diagram/diagramDomains';
import type { DocumentVisibility } from '@/domains/documents/documentsDomains';
import {
  createEmptyEngineGraph,
  mapRecordToEngineGraph,
  mergeEngineGraph,
} from '@/diagram-engine/core/diagram-record.adapter';
import {
  applyEdgeChangesToEngineGraph,
  applyNodeChangesToEngineGraph,
  ATLAS_EDGE_MARKER_END,
  engineGraphToFlowEdges,
  flowEdgeToEngineEdge,
  type AtlasFlowNode,
} from '@/diagram-engine/core/react-flow.adapter';
import { DEFAULT_EDGE_ROUTING } from '@/diagram-engine/edges/diagram-edge.constants';
import type { DiagramEdgeSemanticType } from '@/diagram-engine/model/diagram-core.types';
import type {
  DiagramEdgeAppearance,
  DiagramEngineEdge,
  DiagramEngineGraph,
  DiagramEngineNode,
  DiagramStandardNodeData,
} from '@/diagram-engine/types/diagram-engine.types';

export interface DiagramEditorState {
  readonly graph: DiagramEngineGraph;
  readonly hydrated: boolean;
  readonly selectedNodeId: string | null;
  readonly selectedEdgeId: string | null;
  readonly visibilityDraft: DocumentVisibility;
}

export function createDiagramEditorState(diagramId: string): DiagramEditorState {
  return {
    graph: createEmptyEngineGraph(diagramId),
    hydrated: false,
    selectedNodeId: null,
    selectedEdgeId: null,
    visibilityDraft: 'PRIVATE',
  };
}

export type DiagramEditorAction =
  | { type: 'HYDRATE_FROM_RECORD'; record: DiagramRecord }
  | {
      type: 'HYDRATE_THEN_APPLY_NODE_CHANGES';
      record: DiagramRecord;
      changes: readonly NodeChange<AtlasFlowNode>[];
    }
  | {
      type: 'HYDRATE_THEN_APPLY_EDGE_CHANGES';
      record: DiagramRecord;
      changes: readonly EdgeChange<Edge>[];
    }
  | {
      type: 'HYDRATE_THEN_CONNECT';
      record: DiagramRecord;
      connection: Connection;
    }
  | { type: 'DEHYDRATE' }
  | { type: 'SET_VISIBILITY_DRAFT'; visibility: DocumentVisibility }
  | { type: 'SELECT_NODE'; nodeId: string | null }
  | { type: 'SELECT_EDGE'; edgeId: string | null }
  | { type: 'CLEAR_SELECTION' }
  | {
      type: 'APPLY_NODE_CHANGES';
      changes: readonly NodeChange<AtlasFlowNode>[];
    }
  | { type: 'APPLY_EDGE_CHANGES'; changes: readonly EdgeChange<Edge>[] }
  | { type: 'CONNECT'; connection: Connection }
  | { type: 'ADD_NODE'; node: DiagramEngineNode }
  | { type: 'ADD_ENGINE_EDGE'; edge: DiagramEngineEdge }
  | { type: 'DELETE_NODE'; nodeId: string }
  | { type: 'DELETE_EDGE'; edgeId: string }
  | {
      type: 'UPDATE_NODE_DATA';
      nodeId: string;
      data: Partial<DiagramStandardNodeData>;
    }
  | {
      type: 'UPDATE_EDGE';
      edgeId: string;
      patch: Partial<{
        label: string | undefined;
        routing: DiagramEdgeKind;
        appearance: DiagramEdgeAppearance;
        semanticType: DiagramEdgeSemanticType | undefined;
      }>;
    }
  | { type: 'REPLACE_GRAPH'; graph: DiagramEngineGraph }
  | { type: 'REMOTE_NODE_POSITION'; nodeId: string; x: number; y: number };

function mergeNodeData(
  current: DiagramStandardNodeData,
  patch: Partial<DiagramStandardNodeData>,
): DiagramStandardNodeData {
  return {
    title: patch.title ?? current.title,
    description:
      'description' in patch ? patch.description : current.description,
    status: 'status' in patch ? patch.status : current.status,
    type: patch.type ?? current.type,
    markdown: 'markdown' in patch ? patch.markdown : current.markdown,
    tags: 'tags' in patch ? patch.tags : current.tags,
    icon: 'icon' in patch ? patch.icon : current.icon,
    color: 'color' in patch ? patch.color : current.color,
    relatedDiagramId:
      'relatedDiagramId' in patch
        ? patch.relatedDiagramId
        : current.relatedDiagramId,
    metadata: 'metadata' in patch ? patch.metadata : current.metadata,
  };
}

export function diagramEditorReducer(
  state: DiagramEditorState,
  action: DiagramEditorAction,
): DiagramEditorState {
  switch (action.type) {
    case 'HYDRATE_FROM_RECORD': {
      return {
        graph: mapRecordToEngineGraph(action.record),
        hydrated: true,
        selectedNodeId: null,
        selectedEdgeId: null,
        visibilityDraft: action.record.visibility,
      };
    }
    case 'HYDRATE_THEN_APPLY_NODE_CHANGES': {
      const graph: DiagramEngineGraph = mapRecordToEngineGraph(
        action.record,
      );
      return {
        graph: applyNodeChangesToEngineGraph(graph, action.changes),
        hydrated: true,
        selectedNodeId: null,
        selectedEdgeId: null,
        visibilityDraft: action.record.visibility,
      };
    }
    case 'HYDRATE_THEN_APPLY_EDGE_CHANGES': {
      const graph: DiagramEngineGraph = mapRecordToEngineGraph(
        action.record,
      );
      return {
        graph: applyEdgeChangesToEngineGraph(graph, action.changes),
        hydrated: true,
        selectedNodeId: null,
        selectedEdgeId: null,
        visibilityDraft: action.record.visibility,
      };
    }
    case 'HYDRATE_THEN_CONNECT': {
      const graph: DiagramEngineGraph = mapRecordToEngineGraph(
        action.record,
      );
      if (
        action.connection.source === null ||
        action.connection.target === null
      ) {
        return {
          graph,
          hydrated: true,
          selectedNodeId: null,
          selectedEdgeId: null,
          visibilityDraft: action.record.visibility,
        };
      }
      const flowEdges: Edge[] = engineGraphToFlowEdges(graph);
      const nextFlow: Edge[] = addEdge(
        {
          ...action.connection,
          type: DEFAULT_EDGE_ROUTING,
          animated: false,
          markerEnd: { ...ATLAS_EDGE_MARKER_END },
        },
        flowEdges,
      );
      return {
        graph: mergeEngineGraph(graph, {
          edges: nextFlow.map(flowEdgeToEngineEdge),
        }),
        hydrated: true,
        selectedNodeId: null,
        selectedEdgeId: null,
        visibilityDraft: action.record.visibility,
      };
    }
    case 'DEHYDRATE': {
      return {
        ...state,
        graph: createEmptyEngineGraph(state.graph.id),
        hydrated: false,
        selectedNodeId: null,
        selectedEdgeId: null,
      };
    }
    case 'SET_VISIBILITY_DRAFT': {
      return { ...state, visibilityDraft: action.visibility };
    }
    case 'SELECT_NODE': {
      return {
        ...state,
        selectedNodeId: action.nodeId,
        selectedEdgeId: null,
      };
    }
    case 'SELECT_EDGE': {
      return {
        ...state,
        selectedEdgeId: action.edgeId,
        selectedNodeId: null,
      };
    }
    case 'CLEAR_SELECTION': {
      return {
        ...state,
        selectedNodeId: null,
        selectedEdgeId: null,
      };
    }
    case 'APPLY_NODE_CHANGES': {
      return {
        ...state,
        graph: applyNodeChangesToEngineGraph(state.graph, action.changes),
      };
    }
    case 'APPLY_EDGE_CHANGES': {
      return {
        ...state,
        graph: applyEdgeChangesToEngineGraph(state.graph, action.changes),
      };
    }
    case 'CONNECT': {
      if (
        action.connection.source === null ||
        action.connection.target === null
      ) {
        return state;
      }
      const flowEdges: Edge[] = engineGraphToFlowEdges(state.graph);
      const nextFlow: Edge[] = addEdge(
        {
          ...action.connection,
          type: DEFAULT_EDGE_ROUTING,
          animated: false,
          markerEnd: { ...ATLAS_EDGE_MARKER_END },
        },
        flowEdges,
      );
      return {
        ...state,
        graph: mergeEngineGraph(state.graph, {
          edges: nextFlow.map(flowEdgeToEngineEdge),
        }),
      };
    }
    case 'ADD_NODE': {
      return {
        ...state,
        graph: mergeEngineGraph(state.graph, {
          nodes: [...state.graph.nodes, action.node],
        }),
        selectedNodeId: action.node.id,
        selectedEdgeId: null,
      };
    }
    case 'ADD_ENGINE_EDGE': {
      return {
        ...state,
        graph: mergeEngineGraph(state.graph, {
          edges: [...state.graph.edges, action.edge],
        }),
      };
    }
    case 'DELETE_NODE': {
      const removedEdgeIds: readonly string[] = state.graph.edges
        .filter(
          (e) => e.source === action.nodeId || e.target === action.nodeId,
        )
        .map((e) => e.id);
      const selectedEdgeRemoved: boolean =
        state.selectedEdgeId !== null &&
        removedEdgeIds.includes(state.selectedEdgeId);
      return {
        ...state,
        graph: mergeEngineGraph(state.graph, {
          nodes: state.graph.nodes.filter((n) => n.id !== action.nodeId),
          edges: state.graph.edges.filter(
            (e) => e.source !== action.nodeId && e.target !== action.nodeId,
          ),
        }),
        selectedNodeId:
          state.selectedNodeId === action.nodeId ? null : state.selectedNodeId,
        selectedEdgeId: selectedEdgeRemoved ? null : state.selectedEdgeId,
      };
    }
    case 'DELETE_EDGE': {
      return {
        ...state,
        graph: mergeEngineGraph(state.graph, {
          edges: state.graph.edges.filter((e) => e.id !== action.edgeId),
        }),
        selectedEdgeId:
          state.selectedEdgeId === action.edgeId
            ? null
            : state.selectedEdgeId,
      };
    }
    case 'UPDATE_NODE_DATA': {
      const nodes = state.graph.nodes.map((n) =>
        n.id === action.nodeId
          ? { ...n, data: mergeNodeData(n.data, action.data) }
          : n,
      );
      return {
        ...state,
        graph: mergeEngineGraph(state.graph, { nodes }),
      };
    }
    case 'UPDATE_EDGE': {
      const edges = state.graph.edges.map((e) => {
        if (e.id !== action.edgeId) {
          return e;
        }
        return {
          ...e,
          label:
            action.patch.label !== undefined ? action.patch.label : e.label,
          routing: action.patch.routing ?? e.routing,
          appearance: action.patch.appearance ?? e.appearance,
          semanticType:
            'semanticType' in action.patch
              ? action.patch.semanticType
              : e.semanticType,
        };
      });
      return {
        ...state,
        graph: mergeEngineGraph(state.graph, { edges }),
      };
    }
    case 'REPLACE_GRAPH': {
      return {
        ...state,
        graph: action.graph,
      };
    }
    case 'REMOTE_NODE_POSITION': {
      const nodes = state.graph.nodes.map((n) =>
        n.id === action.nodeId
          ? { ...n, position: { x: action.x, y: action.y } }
          : n,
      );
      return {
        ...state,
        graph: mergeEngineGraph(state.graph, { nodes }),
      };
    }
  }
  const exhaustive: never = action;
  return exhaustive;
}
