'use client';

import {
  createContext,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
} from 'react';
import { useStore } from 'zustand/react';
import { useShallow } from 'zustand/react/shallow';
import type { StoreApi } from 'zustand/vanilla';
import type { DiagramEditorAction } from '@/diagram-engine/core/diagram-editor.reducer';
import {
  createDiagramEditorStore,
  type DiagramEditorPublicState,
  type DiagramEditorStore,
} from '@/diagram-engine/state/create-diagram-editor-store';

const DiagramEditorZustandContext = createContext<StoreApi<
  DiagramEditorStore
> | null>(null);

export interface DiagramEditorStoreProviderProps {
  readonly diagramId: string;
  readonly children: ReactNode;
}

export function DiagramEditorStoreProvider(
  props: DiagramEditorStoreProviderProps,
): ReactNode {
  const { diagramId, children } = props;
  const store: StoreApi<DiagramEditorStore> = useMemo(
    () => createDiagramEditorStore(diagramId),
    [diagramId],
  );
  return (
    <DiagramEditorZustandContext.Provider value={store}>
      {children}
    </DiagramEditorZustandContext.Provider>
  );
}

export function useDiagramEditorStoreApi(): StoreApi<DiagramEditorStore> {
  const value = useContext(DiagramEditorZustandContext);
  if (value === null) {
    throw new Error(
      'useDiagramEditorStoreApi yalnızca DiagramEditorStoreProvider içinde kullanılabilir.',
    );
  }
  return value;
}

export function useDiagramEditorStore<T>(
  selector: (state: DiagramEditorStore) => T,
): T {
  const api = useDiagramEditorStoreApi();
  return useStore(api, selector);
}

export function useDiagramEditorState(): DiagramEditorPublicState {
  const api = useDiagramEditorStoreApi();
  return useStore(
    api,
    useShallow((s) => ({
      graph: s.graph,
      hydrated: s.hydrated,
      selectedNodeId: s.selectedNodeId,
      selectedEdgeId: s.selectedEdgeId,
      visibilityDraft: s.visibilityDraft,
      viewport: s.viewport,
      hoverNodeId: s.hoverNodeId,
      editorCanvasMode: s.editorCanvasMode,
    })),
  );
}

export function useDiagramEditorDispatch(): Dispatch<DiagramEditorAction> {
  return useDiagramEditorStore((s) => s.dispatch);
}
