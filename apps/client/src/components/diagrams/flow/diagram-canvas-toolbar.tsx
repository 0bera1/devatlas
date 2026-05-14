'use client';

import { Panel, useReactFlow } from '@xyflow/react';
import { useDiagramEditorStore } from '@/diagram-engine/hooks/diagram-editor-store';
import type { DiagramEditorCanvasMode } from '@/diagram-engine/state/diagram-editor.store.types';
import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';
import { useCallback } from 'react';

export interface DiagramCanvasToolbarProps {
  readonly selectedNodeId: string | null;
  readonly isReadOnlyCanvas: boolean;
}

export function DiagramCanvasToolbar(
  props: DiagramCanvasToolbarProps,
): ReactNode {
  const { selectedNodeId, isReadOnlyCanvas } = props;
  const { t } = useTranslations();
  const rf = useReactFlow();
  const editorCanvasMode = useDiagramEditorStore((s) => s.editorCanvasMode);
  const setEditorCanvasMode = useDiagramEditorStore(
    (s) => s.setEditorCanvasMode,
  );

  const onFitView = useCallback((): void => {
    const nodes = rf.getNodes();
    if (nodes.length === 0) {
      return;
    }
    const bounds = rf.getNodesBounds(nodes);
    void rf.fitBounds(bounds, { padding: 0.2, duration: 280 });
  }, [rf]);

  const onZoomReset = useCallback((): void => {
    void rf.zoomTo(1, { duration: 200 });
  }, [rf]);

  const onFocusSelected = useCallback((): void => {
    if (selectedNodeId === null) {
      return;
    }
    const node = rf.getNode(selectedNodeId);
    if (node === undefined) {
      return;
    }
    const bounds = rf.getNodesBounds([node]);
    void rf.fitBounds(bounds, { padding: 0.35, duration: 320 });
  }, [rf, selectedNodeId]);

  const onToggleLock = useCallback((): void => {
    const next: DiagramEditorCanvasMode =
      editorCanvasMode === 'view' ? 'edit' : 'view';
    setEditorCanvasMode(next);
  }, [editorCanvasMode, setEditorCanvasMode]);

  return (
    <Panel
      position="top-left"
      className="m-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white/90 p-1.5 shadow-sm backdrop-blur-sm dark:border-zinc-700/90 dark:bg-zinc-950/90"
    >
      <button
        type="button"
        onClick={onFitView}
        className="rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {t('diagrams.editor.canvasFitView')}
      </button>
      <button
        type="button"
        onClick={onZoomReset}
        className="rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {t('diagrams.editor.canvasZoom100')}
      </button>
      <button
        type="button"
        disabled={selectedNodeId === null}
        onClick={onFocusSelected}
        className="rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {t('diagrams.editor.canvasFocusNode')}
      </button>
      <span className="mx-0.5 h-4 w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />
      <button
        type="button"
        onClick={onToggleLock}
        className={`rounded-lg px-2 py-1 text-[11px] font-medium ${
          editorCanvasMode === 'view'
            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
            : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
        }`}
        title={t('diagrams.editor.canvasLockHint')}
      >
        {editorCanvasMode === 'view'
          ? t('diagrams.editor.canvasUnlock')
          : t('diagrams.editor.canvasLock')}
      </button>
      {isReadOnlyCanvas ? (
        <span className="px-1 text-[10px] text-amber-700 dark:text-amber-300">
          {t('diagrams.editor.canvasReadOnlyBadge')}
        </span>
      ) : null}
    </Panel>
  );
}
