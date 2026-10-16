'use client';

import { Panel, useReactFlow } from '@xyflow/react';
import { useDiagramEditorStore } from '@/diagram-engine/hooks/diagram-editor-store';
import type { DiagramEditorCanvasMode } from '@/diagram-engine/state/diagram-editor.store.types';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { DiagramExportControls } from '@/components/diagrams/flow/diagram-export-controls';
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
      className="m-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--border)]/90 bg-[var(--surface)]/90 p-1.5 shadow-sm backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onFitView}
        className="rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--foreground)] hover:bg-[var(--surface)]"
      >
        {t('diagrams.editor.canvasFitView')}
      </button>
      <button
        type="button"
        onClick={onZoomReset}
        className="rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--foreground)] hover:bg-[var(--surface)]"
      >
        {t('diagrams.editor.canvasZoom100')}
      </button>
      <button
        type="button"
        disabled={selectedNodeId === null}
        onClick={onFocusSelected}
        className="rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--foreground)] hover:bg-[var(--surface)] disabled:opacity-40"
      >
        {t('diagrams.editor.canvasFocusNode')}
      </button>
      <span className="mx-0.5 h-4 w-px bg-[var(--border)]" aria-hidden />
      <button
        type="button"
        onClick={onToggleLock}
        className={`rounded-lg px-2 py-1 text-[11px] font-medium ${
          editorCanvasMode === 'view'
            ? 'bg-[var(--foreground)] text-[var(--background)]'
            : 'text-[var(--foreground)] hover:bg-[var(--surface)]'
        }`}
        title={t('diagrams.editor.canvasLockHint')}
      >
        {editorCanvasMode === 'view'
          ? t('diagrams.editor.canvasUnlock')
          : t('diagrams.editor.canvasLock')}
      </button>
      <DiagramExportControls isReadOnlyCanvas={isReadOnlyCanvas} />
      {isReadOnlyCanvas ? (
        <span className="px-1 text-[10px] text-[var(--muted)]">
          {t('diagrams.editor.canvasReadOnlyBadge')}
        </span>
      ) : null}
    </Panel>
  );
}
