import { createStore, type StoreApi } from 'zustand/vanilla';
import {
  createDiagramEditorState,
  diagramEditorReducer,
  type DiagramEditorAction,
  type DiagramEditorState,
} from '@/diagram-engine/core/diagram-editor.reducer';
import type {
  DiagramEditorCanvasMode,
  DiagramEditorViewportState,
} from '@/diagram-engine/state/diagram-editor.store.types';

const DEFAULT_VIEWPORT: DiagramEditorViewportState = {
  x: 0,
  y: 0,
  zoom: 1,
};

export type DiagramEditorStore = DiagramEditorState & {
  readonly viewport: DiagramEditorViewportState;
  readonly hoverNodeId: string | null;
  readonly editorCanvasMode: DiagramEditorCanvasMode;
  readonly dispatch: (action: DiagramEditorAction) => void;
  readonly setViewport: (patch: Partial<DiagramEditorViewportState>) => void;
  readonly setHoverNodeId: (id: string | null) => void;
  readonly setEditorCanvasMode: (mode: DiagramEditorCanvasMode) => void;
};

export type DiagramEditorPublicState = Omit<
  DiagramEditorStore,
  | 'dispatch'
  | 'setViewport'
  | 'setHoverNodeId'
  | 'setEditorCanvasMode'
>;

function pickCoreState(state: DiagramEditorStore): DiagramEditorState {
  return {
    graph: state.graph,
    hydrated: state.hydrated,
    selectedNodeId: state.selectedNodeId,
    selectedEdgeId: state.selectedEdgeId,
    visibilityDraft: state.visibilityDraft,
  };
}

function shouldResetHover(action: DiagramEditorAction): boolean {
  switch (action.type) {
    case 'HYDRATE_FROM_RECORD':
    case 'HYDRATE_THEN_APPLY_NODE_CHANGES':
    case 'HYDRATE_THEN_APPLY_EDGE_CHANGES':
    case 'HYDRATE_THEN_CONNECT':
    case 'DEHYDRATE':
      return true;
    default:
      return false;
  }
}

export function createDiagramEditorStore(
  diagramId: string,
): StoreApi<DiagramEditorStore> {
  const initial: DiagramEditorState = createDiagramEditorState(diagramId);
  return createStore<DiagramEditorStore>((set) => ({
    ...initial,
    viewport: { ...DEFAULT_VIEWPORT },
    hoverNodeId: null,
    editorCanvasMode: 'edit',
    dispatch: (action: DiagramEditorAction): void => {
      set((state) => {
        const nextCore: DiagramEditorState = diagramEditorReducer(
          pickCoreState(state),
          action,
        );
        return {
          ...state,
          ...nextCore,
          ...(shouldResetHover(action) ? { hoverNodeId: null } : {}),
          ...(action.type === 'DEHYDRATE'
            ? { viewport: { ...DEFAULT_VIEWPORT } }
            : {}),
        };
      });
    },
    setViewport: (patch: Partial<DiagramEditorViewportState>): void => {
      set((state) => ({
        ...state,
        viewport: {
          x: patch.x ?? state.viewport.x,
          y: patch.y ?? state.viewport.y,
          zoom: patch.zoom ?? state.viewport.zoom,
        },
      }));
    },
    setHoverNodeId: (id: string | null): void => {
      set((state) => ({ ...state, hoverNodeId: id }));
    },
    setEditorCanvasMode: (mode: DiagramEditorCanvasMode): void => {
      set((state) => ({ ...state, editorCanvasMode: mode }));
    },
  }));
}
