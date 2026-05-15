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
import { applyAtlasFlowPresentation } from '@/components/diagrams/flow/atlas-flow-presentation';
import { useAtlasDiagramNodeTypes } from '@/components/diagrams/flow/atlas-diagram-node-views';
import { DiagramCanvasHoverCard } from '@/components/diagrams/flow/diagram-canvas-hover-card';
import { DiagramCanvasToolbar } from '@/components/diagrams/flow/diagram-canvas-toolbar';
import { DiagramEdgeLabelsOverlay } from '@/components/diagrams/flow/diagram-edge-labels-overlay';
import { DiagramEdgeDetailPanel } from '@/components/diagrams/flow/diagram-edge-detail-panel';
import { LinkedDiagramModal } from '@/components/diagrams/flow/linked-diagram-modal';
import {
  ATLAS_NODE_DETAIL_PANEL_DOM_ID,
  DiagramNodeDetailPanel,
} from '@/components/diagrams/flow/diagram-node-detail-panel';
import { isHttpNetworkError } from '@/api/http/execute-request';
import { CollaborationLiveStrip } from '@/components/collaboration/collaboration-live-strip';
import { DiagramCollaboratorsSection } from '@/components/diagrams/diagram-collaborators-section';
import { DiagramDangerZone } from '@/components/diagrams/diagram-danger-zone';
import { DiagramFavoriteButton } from '@/components/diagrams/diagram-favorite-button';
import { DiagramRelatedSection } from '@/components/diagrams/diagram-related-section';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/providers/toast-provider';
import { mapEngineGraphToSaveBody } from '@/diagram-engine/core/diagram-record.adapter';
import {
  ATLAS_DEFAULT_EDGE_OPTIONS,
  type AtlasFlowNode,
} from '@/diagram-engine/core/react-flow.adapter';
import { DEFAULT_EDGE_ROUTING } from '@/diagram-engine/edges/diagram-edge.constants';
import {
  DiagramEditorStoreProvider,
} from '@/diagram-engine/hooks/diagram-editor-store';
import { useDiagramEditorCanvas } from '@/diagram-engine/hooks/use-diagram-editor-canvas';
import { useDiagramEngine } from '@/diagram-engine/hooks/use-diagram-engine';
import {
  useSelectedEngineEdge,
  useSelectedEngineNode,
} from '@/diagram-engine/selectors/diagram-editor.selectors';
import type { DocumentVisibility } from '@/domains/documents/documentsDomains';
import type { DiagramRecord } from '@/domains/diagram/diagramDomains';
import type {
  DiagramEngineEdge,
  DiagramEngineNode,
} from '@/diagram-engine/types/diagram-engine.types';
import {
  useDiagramByIdQuery,
} from '@/features/diagrams/queries/useDiagram';
import {
  usePatchDiagramMutation,
  useSaveDiagramGraphMutation,
} from '@/features/diagrams/mutations/useDiagramMutation';
import {
  useDiagramRealtime,
  type RemoteNodeMovePayload,
} from '@/hooks/diagram/use-diagram-realtime';
import { useDiagramQueryHydration } from '@/hooks/diagram/use-diagram-query-hydration';
import { useRequireAuth } from '@/hooks/auth/use-require-auth';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface DiagramEditorInnerProps {
  readonly diagramId: string;
}

function DiagramEditorInner(props: DiagramEditorInnerProps): ReactNode {
  const { diagramId } = props;
  const { t } = useTranslations();
  const { token } = useAuth();
  const { showError, showSuccess } = useToast();
  const { canRender } = useRequireAuth();

  const draggingNodeIdRef = useRef<string | null>(null);
  const [linkedModalDiagramId, setLinkedModalDiagramId] = useState<
    string | null
  >(null);

  const engine = useDiagramEngine();

  const {
    data,
    isPending,
    isError,
    error,
  } = useDiagramByIdQuery(diagramId, canRender);

  const { mutateAsync: saveGraph, isPending: saving } =
    useSaveDiagramGraphMutation();

  const { mutateAsync: patchDiagramAsync, isPending: visibilitySaving } =
    usePatchDiagramMutation();

  const {
    graph,
    hydrated,
    selectedNodeId,
    selectedEdgeId,
    visibilityDraft,
    editorCanvasMode,
    flowNodes,
    flowEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onViewportMoveEnd,
  } = useDiagramEditorCanvas();

  const selectedNode: DiagramEngineNode | undefined = useSelectedEngineNode();
  const selectedEdge: DiagramEngineEdge | undefined = useSelectedEngineEdge();

  const isReadOnlyCanvas: boolean = editorCanvasMode === 'view';

  const nodeTypes = useAtlasDiagramNodeTypes();
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

  const onNodeDoubleClick = useCallback(
    (_event: MouseEvent, n: AtlasFlowNode): void => {
      const link: string | undefined = n.data.relatedDiagramId?.trim();
      if (link !== undefined && link.length > 0) {
        setLinkedModalDiagramId(link);
        return;
      }
      engine.selectNode(n.id);
      requestAnimationFrame((): void => {
        document
          .getElementById(ATLAS_NODE_DETAIL_PANEL_DOM_ID)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    },
    [engine],
  );

  const onRemoteNodeMove = useCallback(
    (payload: RemoteNodeMovePayload): void => {
      if (draggingNodeIdRef.current === payload.nodeId) {
        return;
      }
      engine.remoteNodePosition(payload.nodeId, payload.x, payload.y);
    },
    [engine],
  );

  const realtimeEnabled: boolean = canRender && hydrated;
  const { emitNodeMove, peerCount, connection, connectionError, reconnect } =
    useDiagramRealtime(
      diagramId,
      token,
      realtimeEnabled,
      onRemoteNodeMove,
    );

  useDiagramQueryHydration(data, diagramId, engine);

  useEffect((): (() => void) => {
    const handler = (e: Event): void => {
      const id: string = String(
        (e as CustomEvent<string>).detail ?? '',
      ).trim();
      if (id.length > 0) {
        setLinkedModalDiagramId(id);
      }
    };
    window.addEventListener('atlas-open-linked-diagram', handler);
    return (): void => {
      window.removeEventListener('atlas-open-linked-diagram', handler);
    };
  }, []);

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

  const addNode = useCallback((): void => {
    const id: string = crypto.randomUUID();
    const count: number = graph.nodes.length;
    const node: DiagramEngineNode = {
      id,
      position: { x: 80 + count * 28, y: 80 + count * 22 },
      data: {
        title: t('diagrams.editor.defaultNodeLabel'),
        type: 'text',
      },
    };
    engine.addNode(node);
  }, [engine, graph.nodes.length, t]);

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
    const cacheNode: DiagramEngineNode = {
      id: cacheNodeId,
      position: {
        x: selectedNode.position.x + 260,
        y: selectedNode.position.y,
      },
      data: {
        title: 'Redis',
        type: 'cache',
      },
    };
    const edge: DiagramEngineEdge = {
      id: crypto.randomUUID(),
      source: selectedNode.id,
      target: cacheNodeId,
      label: 'cache',
      routing: DEFAULT_EDGE_ROUTING,
      appearance: 'animated',
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
    const dbNode: DiagramEngineNode = {
      id: databaseNodeId,
      position: {
        x: selectedNode.position.x,
        y: selectedNode.position.y + 180,
      },
      data: {
        title: 'PostgreSQL',
        type: 'database',
      },
    };
    const edge: DiagramEngineEdge = {
      id: crypto.randomUUID(),
      source: selectedNode.id,
      target: databaseNodeId,
      label: 'fallback',
      routing: DEFAULT_EDGE_ROUTING,
      appearance: 'default',
    };
    engine.addNode(dbNode);
    engine.addEngineEdge(edge);
  }, [engine, selectedNode]);

  const onVisibilityChange = useCallback(
    async (next: DocumentVisibility): Promise<void> => {
      if (data === undefined || data.viewerAccess !== 'owner') {
        return;
      }
      engine.setVisibilityDraft(next);
      try {
        const record = await patchDiagramAsync({
          diagramId,
          body: { visibility: next },
        });
        engine.setVisibilityDraft(record.visibility);
        showSuccess(t('diagrams.editor.visibilitySaved'));
      } catch (err: unknown) {
        engine.setVisibilityDraft(data.visibility);
        const msg: string = isHttpNetworkError(err)
          ? t('errors.network')
          : err instanceof Error
            ? err.message
            : t('diagrams.editor.saveFailed');
        showError(msg);
      }
    },
    [
      data,
      diagramId,
      engine,
      patchDiagramAsync,
      showError,
      showSuccess,
      t,
    ],
  );

  if (!canRender) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-zinc-500 dark:text-zinc-400">
        {t('common.loading')}
      </main>
    );
  }

  if (isPending && data === undefined) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <p className="text-sm text-zinc-500">{t('diagrams.editor.loading')}</p>
      </main>
    );
  }

  if (isError && error !== null) {
    const msg: string = isHttpNetworkError(error)
      ? t('errors.network')
      : error.message;
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <p className="text-sm text-red-600 dark:text-red-400">{msg}</p>
        <Link
          href="/diagrams"
          className="mt-4 inline-block text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          {t('diagrams.editor.backToList')}
        </Link>
      </main>
    );
  }

  if (data === undefined) {
    return null;
  }

  const diagram: DiagramRecord = data;

  return (
    <>
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 lg:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/diagrams"
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            {t('diagrams.editor.backToList')}
          </Link>
          <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {diagram.title}
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t('diagrams.editor.hint')}
          </p>
          <CollaborationLiveStrip
            connection={connection}
            peerCount={peerCount}
            errorDetail={connectionError}
            onRetry={
              connection === 'error' || connection === 'disconnected'
                ? reconnect
                : undefined
            }
            showSoloHint
          />
          {diagram.viewerAccess === 'owner' ? (
            <label className="mt-3 block max-w-xs text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <span className="mb-1 block">
                {t('diagrams.editor.visibilityLabel')}
              </span>
              <select
                value={visibilityDraft}
                disabled={visibilitySaving}
                onChange={(e) => {
                  const v = e.target.value as DocumentVisibility;
                  void onVisibilityChange(v);
                }}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="PRIVATE">
                  {t('documents.visibilityPrivate')}
                </option>
                <option value="PUBLIC">
                  {t('documents.visibilityPublic')}
                </option>
              </select>
            </label>
          ) : diagram.viewerAccess === 'collaborator' ? (
            <p className="mt-3 max-w-md text-xs text-amber-800 dark:text-amber-200">
              {t('diagrams.editor.collaboratorRoleHint')}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <DiagramFavoriteButton
            diagramId={diagram.id}
            favoriteCount={diagram.favoriteCount}
          />
          <button
            type="button"
            onClick={addNode}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            {t('diagrams.editor.addNode')}
          </button>
          <button
            type="button"
            disabled={!hydrated || saving}
            onClick={() => {
              void onSave();
            }}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-400"
          >
            {saving ? t('diagrams.editor.saving') : t('diagrams.editor.save')}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,420px)] lg:items-start">
        <div className="relative h-[min(70vh,640px)] min-h-[420px] overflow-visible rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
          {connection === 'connected' && peerCount > 0 ? (
            <div
              className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 shadow-sm dark:border-emerald-800/80 dark:bg-zinc-950/95 dark:text-emerald-300"
              aria-live="polite"
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
                aria-hidden
              />
              {t('collaboration.canvasBadge')}
            </div>
          ) : null}
          {!hydrated ? (
            <div className="flex h-full min-h-[420px] w-full items-center justify-center rounded-2xl text-sm text-zinc-500 dark:text-zinc-400">
              {t('diagrams.editor.loading')}
            </div>
          ) : (
            <ReactFlow
              key={diagramId}
              id={diagramId}
              defaultEdgeOptions={ATLAS_DEFAULT_EDGE_OPTIONS}
              nodes={presentedNodes}
              edges={presentedEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onInit={(instance): void => {
                void instance.fitView({ padding: 0.15 });
              }}
              onNodeDragStart={(_event, node: AtlasFlowNode): void => {
                draggingNodeIdRef.current = node.id;
              }}
              onNodeDrag={(_event, node: AtlasFlowNode): void => {
                emitNodeMove(node.id, node.position.x, node.position.y);
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
              className="h-full w-full rounded-2xl"
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

        <div className="flex flex-col gap-6">
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
          <DiagramCollaboratorsSection
            diagramId={diagramId}
            enabled={hydrated && diagram.viewerAccess === 'owner'}
          />
          <DiagramRelatedSection diagramId={diagramId} enabled={hydrated} />
          {diagram.viewerAccess === 'owner' ? (
            <DiagramDangerZone
              diagramId={diagram.id}
              diagramTitle={diagram.title}
            />
          ) : null}
        </div>
      </div>
    </main>
    {linkedModalDiagramId !== null ? (
      <LinkedDiagramModal
        diagramId={linkedModalDiagramId}
        onClose={(): void => setLinkedModalDiagramId(null)}
      />
    ) : null}
    </>
  );
}

export interface DiagramEditorViewProps {
  readonly diagramId: string;
}

export function DiagramEditorView(props: DiagramEditorViewProps): ReactNode {
  const { diagramId } = props;
  return (
    <ReactFlowProvider>
      <DiagramEditorStoreProvider key={diagramId} diagramId={diagramId}>
        <DiagramEditorInner diagramId={diagramId} />
      </DiagramEditorStoreProvider>
    </ReactFlowProvider>
  );
}
