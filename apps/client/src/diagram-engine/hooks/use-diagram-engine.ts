'use client';

import { useMemo } from 'react';
import { DiagramEngine } from '@/diagram-engine/core/diagram-engine';
import { useDiagramEditorStoreApi } from '@/diagram-engine/state/diagram-editor-store.context';

export function useDiagramEngine(): DiagramEngine {
  const storeApi = useDiagramEditorStoreApi();
  return useMemo((): DiagramEngine => new DiagramEngine(storeApi), [storeApi]);
}
