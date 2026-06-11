'use client';

import '@xyflow/react/dist/style.css';

import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { isHttpNetworkError } from '@/api/http/execute-request';
import { applyAtlasFlowPresentation } from '@/components/diagrams/flow/atlas-flow-presentation';
import { useAtlasDiagramNodeTypes } from '@/components/diagrams/flow/atlas-diagram-node-views';
import { DiagramCanvasHoverCard } from '@/components/diagrams/flow/diagram-canvas-hover-card';
import { DiagramCanvasToolbar } from '@/components/diagrams/flow/diagram-canvas-toolbar';
import { DiagramEdgeLabelsOverlay } from '@/components/diagrams/flow/diagram-edge-labels-overlay';
import { DiagramEdgeDetailPanel } from '@/components/diagrams/flow/diagram-edge-detail-panel';
import { DiagramNodeDetailPanel } from '@/components/diagrams/flow/diagram-node-detail-panel';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/providers/toast-provider';
import { mapEngineGraphToSaveBody } from '@/diagram-engine/core/diagram-record.adapter';
import {
  ATLAS_DEFAULT_EDGE_OPTIONS,
  type AtlasFlowNode,
} from '@/diagram-engine/core/react-flow.adapter';
import { DiagramEditorStoreProvider } from '@/diagram-engine/hooks/diagram-editor-store';
import { useDiagramEditorCanvas } from '@/diagram-engine/hooks/use-diagram-editor-canvas';
import { useDiagramEngine } from '@/diagram-engine/hooks/use-diagram-engine';
import {
  useSelectedEngineEdge,
  useSelectedEngineNode,
} from '@/diagram-engine/selectors/diagram-editor.selectors';
import { useDiagramByIdQuery } from '@/features/diagrams/queries/useDiagram';
import { useSaveDiagramGraphMutation } from '@/features/diagrams/mutations/useDiagramMutation';
import { useDiagramQueryHydration } from '@/hooks/diagram/use-diagram-query-hydration';
import { useRequireAuth } from '@/hooks/auth/use-require-auth';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function MaximizeToEditorIcon(): ReactNode {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

interface LinkedDiagramModalInnerProps {
  readonly diagramId: string;
  readonly onClose: () => void;
}

function LinkedDiagramModalInner(
  props: LinkedDiagramModalInnerProps,
): ReactNode {
  const { diagramId, onClose } = props;
  const { t } = useTranslations();
  const { token } = useAuth();
  const { showError, showSuccess } = useToast();
  const { canRender } = useRequireAuth();
  const draggingNodeIdRef = useRef<string | null>(null);

  const engine = useDiagramEngine();
  const { data, isPending, isError, error } = useDiagramByIdQuery(
    diagramId,
    canRender,
  );

  useDiagramQueryHydration(data, diagramId, engine);

  const {
    graph,
    hydrated,
    selectedNodeId,
    selectedEdgeId,
    editorCanvasMode,
    flowNodes,
    flowEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onViewportMoveEnd,
  } = useDiagramEditorCanvas();

  const selectedNode = useSelectedEngineNode();
  const selectedEdge = useSelectedEngineEdge();
  const nodeTypes = useAtlasDiagramNodeTypes();
  const isReadOnlyCanvas: boolean = editorCanvasMode === 'view';

  const { nodes: presentedNodes, edges: presentedEdges } = useMemo(
    () =>
      applyAtlasFlowPresentation(
        flowNodes,
        flowEdges,
        selectedNodeId,
        selectedEdgeId,
      ),
    [flowEdges, flowNodes, selectedEdgeId, selectedNodeId],
  );

  const { mutateAsync: saveGraph, isPending: saving } =
    useSaveDiagramGraphMutation();

  const onSave = useCallback(async (): Promise<void> => {
    try {
      const body = mapEngineGraphToSaveBody(graph);
      for (const n of body.nodes) {
        if (n.label.trim().length === 0 || n.label === '…') {
          showError(t('diagrams.editor.labelRequired'));
          return;
        }
      }
      await saveGraph({ diagramId, body });
      showSuccess(t('diagrams.editor.saved'));
    } catch (err: unknown) {
      const msg: string = isHttpNetworkError(err)
        ? t('errors.network')
        : err instanceof Error
          ? err.message
          : t('diagrams.editor.saveFailed');
      showError(msg);
    }
  }, [diagramId, graph, saveGraph, showError, showSuccess, t]);

  const deleteSelectedNode = useCallback((): void => {
    if (selectedNodeId === null) {
      return;
    }
    engine.deleteNode(selectedNodeId);
  }, [engine, selectedNodeId]);

  const deleteSelectedEdge = useCallback((): void => {
    if (selectedEdgeId === null) {
      return;
    }
    engine.deleteEdge(selectedEdgeId);
  }, [engine, selectedEdgeId]);

  const addCacheAfterSelectedApi = useCallback((): void => {
    if (selectedNode === undefined || selectedNode.data.type !== 'api') {
      return;
    }
    const cacheNodeId: string = crypto.randomUUID();
    const cacheNode = {
      id: cacheNodeId,
      position: {
        x: selectedNode.position.x + 260,
        y: selectedNode.position.y,
      },
      data: { title: 'Redis', type: 'cache' as const },
    };
    const edge = {
      id: crypto.randomUUID(),
      source: selectedNode.id,
      target: cacheNodeId,
      label: 'cache',
      routing: 'smoothstep' as const,
      appearance: 'animated' as const,
    };
    engine.addNode(cacheNode);
    engine.addEngineEdge(edge);
  }, [engine, selectedNode]);

  const addDatabaseAfterSelectedCache = useCallback((): void => {
    if (
      selectedNode === undefined ||
      (selectedNode.data.type !== 'cache' &&
        !selectedNode.data.title.toLowerCase().includes('redis'))
    ) {
      return;
    }
    const databaseNodeId: string = crypto.randomUUID();
    const dbNode = {
      id: databaseNodeId,
      position: {
        x: selectedNode.position.x,
        y: selectedNode.position.y + 180,
      },
      data: { title: 'PostgreSQL', type: 'database' as const },
    };
    const edge = {
      id: crypto.randomUUID(),
      source: selectedNode.id,
      target: databaseNodeId,
      label: 'fallback',
      routing: 'smoothstep' as const,
      appearance: 'default' as const,
    };
    engine.addNode(dbNode);
    engine.addEngineEdge(edge);
  }, [engine, selectedNode]);

  const onNodeDoubleClick = useCallback(
    (_event: MouseEvent, n: AtlasFlowNode): void => {
      const link: string | undefined = n.data.relatedDiagramId?.trim();
      if (link !== undefined && link.length > 0) {
        window.dispatchEvent(
          new CustomEvent('atlas-open-linked-diagram', { detail: link }),
        );
      }
    },
    [],
  );

  return (
    <div
      className="flex max-h-[min(88vh,860px)] min-h-[420px] w-full max-w-[min(96vw,1180px)] flex-col overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-br from-white via-zinc-50 to-violet-50/80 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] dark:border-violet-500/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-violet-950/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="linked-diagram-modal-title"
      onClick={(e): void => {
        e.stopPropagation();
      }}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-violet-200/40 bg-white/60 px-4 py-3 backdrop-blur-md dark:border-violet-900/30 dark:bg-zinc-950/60">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            {t('diagrams.editor.linkedModalBadge')}
          </p>
          <h2
            id="linked-diagram-modal-title"
            className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {data?.title ?? t('diagrams.editor.linkedModalLoading')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/diagrams/${encodeURIComponent(diagramId)}`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/90 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            title={t('diagrams.editor.linkedModalOpenFull')}
            aria-label={t('diagrams.editor.linkedModalOpenFull')}
          >
            <MaximizeToEditorIcon />
          </Link>
          <button
            type="button"
            disabled={!hydrated || saving}
            onClick={(): void => {
              void onSave();
            }}
            className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {saving ? t('diagrams.editor.saving') : t('diagrams.editor.save')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t('diagrams.editor.linkedModalClose')}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[1fr_minmax(280px,340px)]">
        <div className="relative min-h-[320px] rounded-xl border border-zinc-200/80 bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-900/50">
          {!canRender || isPending ? (
            <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
              {t('diagrams.editor.loading')}
            </div>
          ) : isError && error !== null ? (
            <div className="flex h-full min-h-[320px] items-center justify-center px-4 text-center text-sm text-red-600">
              {error.message}
            </div>
          ) : !hydrated ? (
            <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
              {t('diagrams.editor.loading')}
            </div>
          ) : (
            <ReactFlow
              key={diagramId}
              id={`linked-${diagramId}`}
              defaultEdgeOptions={ATLAS_DEFAULT_EDGE_OPTIONS}
              nodes={presentedNodes}
              edges={presentedEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onInit={(instance): void => {
                void instance.fitView({ padding: 0.18 });
              }}
              onNodeDragStart={(_e, node: AtlasFlowNode): void => {
                draggingNodeIdRef.current = node.id;
              }}
              onNodeDragStop={(): void => {
                draggingNodeIdRef.current = null;
              }}
              onNodeClick={(_, n: AtlasFlowNode): void => {
                engine.selectNode(n.id);
              }}
              onNodeDoubleClick={onNodeDoubleClick}
              onEdgeClick={(_, edge: Edge): void => {
                engine.selectEdge(edge.id);
              }}
              onPaneClick={(): void => {
                engine.clearSelection();
              }}
              onMoveEnd={onViewportMoveEnd}
              nodesDraggable={!isReadOnlyCanvas}
              nodesConnectable={!isReadOnlyCanvas}
              elementsSelectable={!isReadOnlyCanvas}
              className="h-full min-h-[320px] w-full rounded-xl"
            >
              <DiagramCanvasToolbar
                selectedNodeId={selectedNodeId}
                isReadOnlyCanvas={isReadOnlyCanvas}
              />
              <DiagramCanvasHoverCard graph={graph} />
              <DiagramEdgeLabelsOverlay edges={presentedEdges} />
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
              <Controls showInteractive={false} />
              <MiniMap
                zoomable
                pannable
                className="!bg-white/90 dark:!bg-zinc-950/90"
              />
            </ReactFlow>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          {selectedNode !== undefined && selectedNodeId !== null ? (
            <DiagramNodeDetailPanel
              selectedNode={selectedNode}
              selectedNodeId={selectedNodeId}
              engine={engine}
              onSuggestCache={addCacheAfterSelectedApi}
              onSuggestDatabase={addDatabaseAfterSelectedCache}
              onDeleteNode={deleteSelectedNode}
            />
          ) : selectedEdge !== undefined && selectedEdgeId !== null ? (
            <DiagramEdgeDetailPanel
              selectedEdge={selectedEdge}
              selectedEdgeId={selectedEdgeId}
              engine={engine}
              onDeleteEdge={deleteSelectedEdge}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              {t('diagrams.editor.selectElement')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export interface LinkedDiagramModalProps {
  readonly diagramId: string;
  readonly onClose: () => void;
}

export function LinkedDiagramModal(props: LinkedDiagramModalProps): ReactNode {
  const { diagramId, onClose } = props;
  const [mounted, setMounted] = useState(false);

  useEffect((): void => {
    setMounted(true);
  }, []);

  useEffect((): (() => void) | void => {
    if (!mounted) {
      return undefined;
    }
    const prev: string = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return (): void => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  useEffect((): (() => void) | void => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return (): void => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <ReactFlowProvider>
        <DiagramEditorStoreProvider diagramId={diagramId}>
          <LinkedDiagramModalInner diagramId={diagramId} onClose={onClose} />
        </DiagramEditorStoreProvider>
      </ReactFlowProvider>
    </div>,
    document.body,
  );
}
