'use client';

import '@xyflow/react/dist/style.css';

import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  type Connection,
  type Edge,
  MiniMap,
  type Node,
  NodeProps,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { isHttpNetworkError } from '@/api/http/execute-request';
import { CollaborationLiveStrip } from '@/components/collaboration/collaboration-live-strip';
import { DiagramCollaboratorsSection } from '@/components/diagrams/diagram-collaborators-section';
import { DiagramRelatedSection } from '@/components/diagrams/diagram-related-section';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/providers/toast-provider';
import type { DocumentVisibility } from '@/domains/documentsDomains';
import type { DiagramNodeKind, DiagramRecord } from '@/domains/diagramDomains';
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
} from '@/hooks/use-diagram-realtime';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AtlasNodeData = {
  label: string;
  nodeType: DiagramNodeKind;
};

type AtlasNode = Node<AtlasNodeData, 'atlas'>;

function parseNodeType(raw: string): DiagramNodeKind {
  switch (raw) {
    case 'db':
    case 'service':
    case 'api':
    case 'text':
      return raw;
    default:
      return 'text';
  }
}

function mapRecordToFlow(record: DiagramRecord): {
  nodes: AtlasNode[];
  edges: Edge[];
} {
  const nodes: AtlasNode[] = record.nodes.map(
    (n): AtlasNode => ({
      id: n.id,
      type: 'atlas',
      position: { x: n.x, y: n.y },
      data: {
        label: n.label,
        nodeType: parseNodeType(n.type),
      },
    }),
  );

  const edges: Edge[] = record.edges.map(
    (e): Edge => ({
      id: e.id,
      source: e.fromNodeId,
      target: e.toNodeId,
      label: e.label ?? undefined,
    }),
  );

  return { nodes, edges };
}

function mapFlowToSaveBody(
  nodes: AtlasNode[],
  edges: Edge[],
): {
  nodes: {
    id: string;
    label: string;
    type: DiagramNodeKind;
    x: number;
    y: number;
  }[];
  edges: { from: string; to: string; label?: string }[];
} {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      label: n.data.label.trim().length > 0 ? n.data.label.trim() : '…',
      type: n.data.nodeType,
      x: n.position.x,
      y: n.position.y,
    })),
    edges: edges.map((e) => ({
      from: e.source,
      to: e.target,
      label:
        e.label !== undefined && String(e.label).trim().length > 0
          ? String(e.label).trim()
          : undefined,
    })),
  };
}

const AtlasNodeView = memo(function AtlasNodeView(
  props: NodeProps<AtlasNode>,
): ReactNode {
  const { data } = props;
  return (
    <div className="min-w-[128px] rounded-lg border border-violet-300/80 bg-white px-3 py-2 shadow-md dark:border-violet-600/60 dark:bg-zinc-900">
      <div className="text-[10px] font-medium uppercase tracking-wide text-violet-600 dark:text-violet-300">
        {data.nodeType}
      </div>
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {data.label}
      </div>
    </div>
  );
});

const nodeTypes = { atlas: AtlasNodeView };

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

  const [nodes, setNodes, onNodesChange] = useNodesState<AtlasNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [visibilityDraft, setVisibilityDraft] =
    useState<DocumentVisibility>('PRIVATE');

  const onRemoteNodeMove = useCallback(
    (payload: RemoteNodeMovePayload): void => {
      if (draggingNodeIdRef.current === payload.nodeId) {
        return;
      }
      setNodes((prev: AtlasNode[]) =>
        prev.map((n: AtlasNode): AtlasNode =>
          n.id === payload.nodeId
            ? {
                ...n,
                position: { x: payload.x, y: payload.y },
              }
            : n,
        ),
      );
    },
    [setNodes],
  );

  const realtimeEnabled: boolean = canRender && hydrated;
  const { emitNodeMove, peerCount, connection, connectionError, reconnect } =
    useDiagramRealtime(
      diagramId,
      token,
      realtimeEnabled,
      onRemoteNodeMove,
    );

  useEffect(() => {
    if (data === undefined || data.id !== diagramId) {
      setHydrated(false);
      return;
    }
    const mapped = mapRecordToFlow(data);
    setNodes(mapped.nodes);
    setEdges(mapped.edges);
    setVisibilityDraft(data.visibility);
    setHydrated(true);
    setSelectedId(null);
  }, [data, diagramId, setEdges, setNodes]);

  const onConnect = useCallback(
    (params: Connection): void => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  const selectedNode: AtlasNode | undefined = useMemo(
    () => nodes.find((n: AtlasNode): boolean => n.id === selectedId),
    [nodes, selectedId],
  );

  const onSave = useCallback(async (): Promise<void> => {
    try {
      const body = mapFlowToSaveBody(nodes, edges);
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
  }, [diagramId, edges, nodes, saveGraph, showError, showSuccess, t]);

  const addNode = useCallback((): void => {
    const id: string = crypto.randomUUID();
    setNodes((nds: AtlasNode[]) => {
      return [
        ...nds,
        {
          id,
          type: 'atlas',
          position: { x: 80 + nds.length * 28, y: 80 + nds.length * 22 },
          data: {
            label: t('diagrams.editor.defaultNodeLabel'),
            nodeType: 'text',
          },
        },
      ];
    });
    setSelectedId(id);
  }, [setNodes, t]);

  const onVisibilityChange = useCallback(
    async (next: DocumentVisibility): Promise<void> => {
      if (data === undefined || data.viewerAccess !== 'owner') {
        return;
      }
      setVisibilityDraft(next);
      try {
        const record = await patchDiagramAsync({
          diagramId,
          body: { visibility: next },
        });
        setVisibilityDraft(record.visibility);
        showSuccess(t('diagrams.editor.visibilitySaved'));
      } catch (err: unknown) {
        setVisibilityDraft(data.visibility);
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

      <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
        <div className="relative h-[min(70vh,640px)] min-h-[420px] rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
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
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeDragStart={(_event, node: AtlasNode): void => {
              draggingNodeIdRef.current = node.id;
            }}
            onNodeDrag={(_event, node: AtlasNode): void => {
              emitNodeMove(node.id, node.position.x, node.position.y);
            }}
            onNodeDragStop={(): void => {
              draggingNodeIdRef.current = null;
            }}
            onNodeClick={(_, n: AtlasNode): void => {
              setSelectedId(n.id);
            }}
            onPaneClick={(): void => {
              setSelectedId(null);
            }}
            fitView
            className="rounded-2xl"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
            <MiniMap
              zoomable
              pannable
              className="!bg-white/90 dark:!bg-zinc-950/90"
            />
          </ReactFlow>
        </div>

        <div className="flex flex-col gap-6">
          {selectedNode !== undefined ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t('diagrams.editor.nodeSettings')}
              </h2>
              <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {t('diagrams.editor.nodeLabel')}
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    const v: string = e.target.value;
                    setNodes((prev: AtlasNode[]) =>
                      prev.map((n: AtlasNode): AtlasNode =>
                        n.id === selectedId
                          ? {
                              ...n,
                              data: { ...n.data, label: v },
                            }
                          : n,
                      ),
                    );
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {t('diagrams.editor.nodeKind')}
                <select
                  value={selectedNode.data.nodeType}
                  onChange={(e) => {
                    const v = e.target.value as DiagramNodeKind;
                    setNodes((prev: AtlasNode[]) =>
                      prev.map((n: AtlasNode): AtlasNode =>
                        n.id === selectedId
                          ? {
                              ...n,
                              data: { ...n.data, nodeType: v },
                            }
                          : n,
                      ),
                    );
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="text">text</option>
                  <option value="db">db</option>
                  <option value="service">service</option>
                  <option value="api">api</option>
                </select>
              </label>
            </section>
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              {t('diagrams.editor.selectNode')}
            </p>
          )}
          <DiagramCollaboratorsSection
            diagramId={diagramId}
            enabled={hydrated && diagram.viewerAccess === 'owner'}
          />
          <DiagramRelatedSection diagramId={diagramId} enabled={hydrated} />
        </div>
      </div>
    </main>
  );
}

export interface DiagramEditorViewProps {
  readonly diagramId: string;
}

export function DiagramEditorView(props: DiagramEditorViewProps): ReactNode {
  const { diagramId } = props;
  return (
    <ReactFlowProvider>
      <DiagramEditorInner diagramId={diagramId} />
    </ReactFlowProvider>
  );
}
