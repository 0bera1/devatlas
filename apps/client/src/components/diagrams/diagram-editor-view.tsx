'use client';

import '@xyflow/react/dist/style.css';

import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  type Connection,
  type Edge,
  Handle,
  MarkerType,
  MiniMap,
  type Node,
  NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { isHttpNetworkError } from '@/api/http/execute-request';
import { CollaborationLiveStrip } from '@/components/collaboration/collaboration-live-strip';
import { DiagramCollaboratorsSection } from '@/components/diagrams/diagram-collaborators-section';
import { DiagramDangerZone } from '@/components/diagrams/diagram-danger-zone';
import { DiagramFavoriteButton } from '@/components/diagrams/diagram-favorite-button';
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

type AtlasEdgeType = 'smoothstep' | 'straight' | 'step' | 'default';

type AtlasNodeData = {
  label: string;
  nodeType: DiagramNodeKind;
};

type AtlasNode = Node<AtlasNodeData, 'atlas'>;

const DEFAULT_EDGE_TYPE: AtlasEdgeType = 'smoothstep';

const NODE_TYPE_STYLES: Record<
  DiagramNodeKind,
  { readonly border: string; readonly badge: string; readonly accent: string }
> = {
  text: {
    border: 'border-zinc-300 dark:border-zinc-700',
    badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
    accent: 'bg-zinc-500',
  },
  api: {
    border: 'border-violet-300 dark:border-violet-700',
    badge:
      'bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-200',
    accent: 'bg-violet-500',
  },
  service: {
    border: 'border-sky-300 dark:border-sky-700',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-200',
    accent: 'bg-sky-500',
  },
  db: {
    border: 'border-emerald-300 dark:border-emerald-700',
    badge:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200',
    accent: 'bg-emerald-500',
  },
  cache: {
    border: 'border-amber-300 dark:border-amber-700',
    badge:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-200',
    accent: 'bg-amber-500',
  },
  queue: {
    border: 'border-fuchsia-300 dark:border-fuchsia-700',
    badge:
      'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/70 dark:text-fuchsia-200',
    accent: 'bg-fuchsia-500',
  },
};

function parseNodeType(raw: string): DiagramNodeKind {
  switch (raw) {
    case 'db':
    case 'service':
    case 'api':
    case 'cache':
    case 'queue':
    case 'text':
      return raw;
    default:
      return 'text';
  }
}

function parseEdgeType(raw: string | null | undefined): AtlasEdgeType {
  switch (raw) {
    case 'straight':
    case 'step':
    case 'default':
    case 'smoothstep':
      return raw;
    default:
      return DEFAULT_EDGE_TYPE;
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
      width: n.width ?? undefined,
      height: n.height ?? undefined,
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
      type: parseEdgeType(e.type),
      animated: e.animated,
      markerEnd: { type: MarkerType.ArrowClosed },
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
    width?: number | null;
    height?: number | null;
  }[];
  edges: {
    from: string;
    to: string;
    label?: string;
    type?: AtlasEdgeType;
    animated?: boolean;
  }[];
} {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      label: n.data.label.trim().length > 0 ? n.data.label.trim() : '…',
      type: n.data.nodeType,
      x: n.position.x,
      y: n.position.y,
      width: n.width ?? null,
      height: n.height ?? null,
    })),
    edges: edges.map((e) => ({
      from: e.source,
      to: e.target,
      label:
        e.label !== undefined && String(e.label).trim().length > 0
          ? String(e.label).trim()
          : undefined,
      type: parseEdgeType(typeof e.type === 'string' ? e.type : undefined),
      animated: e.animated ?? false,
    })),
  };
}

const AtlasNodeView = memo(function AtlasNodeView(
  props: NodeProps<AtlasNode>,
): ReactNode {
  const { data } = props;
  const style = NODE_TYPE_STYLES[data.nodeType];
  return (
    <div
      className={`relative min-w-[148px] rounded-xl border-2 bg-white px-3 py-2 shadow-md dark:bg-zinc-900 ${style.border}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`!h-3 !w-3 !border-2 !border-white dark:!border-zinc-900 ${style.accent}`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`!h-3 !w-3 !border-2 !border-white dark:!border-zinc-900 ${style.accent}`}
      />
      <div
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
      >
        {data.nodeType}
      </div>
      <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
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
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
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
    setSelectedEdgeId(null);
  }, [data, diagramId, setEdges, setNodes]);

  const onConnect = useCallback(
    (params: Connection): void => {
      if (params.source === null || params.target === null) {
        return;
      }
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: DEFAULT_EDGE_TYPE,
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const selectedNode: AtlasNode | undefined = useMemo(
    () => nodes.find((n: AtlasNode): boolean => n.id === selectedId),
    [nodes, selectedId],
  );

  const selectedEdge: Edge | undefined = useMemo(
    () => edges.find((edge: Edge): boolean => edge.id === selectedEdgeId),
    [edges, selectedEdgeId],
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
    setSelectedEdgeId(null);
  }, [setNodes, t]);

  const deleteSelectedNode = useCallback((): void => {
    if (selectedId === null) {
      return;
    }
    setNodes((prev: AtlasNode[]) =>
      prev.filter((node: AtlasNode): boolean => node.id !== selectedId),
    );
    setEdges((prev: Edge[]) =>
      prev.filter(
        (edge: Edge): boolean =>
          edge.source !== selectedId && edge.target !== selectedId,
      ),
    );
    setSelectedId(null);
  }, [selectedId, setEdges, setNodes]);

  const deleteSelectedEdge = useCallback((): void => {
    if (selectedEdgeId === null) {
      return;
    }
    setEdges((prev: Edge[]) =>
      prev.filter((edge: Edge): boolean => edge.id !== selectedEdgeId),
    );
    setSelectedEdgeId(null);
  }, [selectedEdgeId, setEdges]);

  const addCacheAfterSelectedApi = useCallback((): void => {
    if (selectedNode === undefined || selectedNode.data.nodeType !== 'api') {
      return;
    }
    const cacheNodeId: string = crypto.randomUUID();
    setNodes((prev: AtlasNode[]) => [
      ...prev,
      {
        id: cacheNodeId,
        type: 'atlas',
        position: {
          x: selectedNode.position.x + 260,
          y: selectedNode.position.y,
        },
        data: {
          label: 'Redis',
          nodeType: 'cache',
        },
      },
    ]);
    setEdges((prev: Edge[]) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        source: selectedNode.id,
        target: cacheNodeId,
        label: 'cache',
        type: DEFAULT_EDGE_TYPE,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ]);
    setSelectedId(cacheNodeId);
    setSelectedEdgeId(null);
  }, [selectedNode, setEdges, setNodes]);

  const addDatabaseAfterSelectedCache = useCallback((): void => {
    if (
      selectedNode === undefined ||
      (selectedNode.data.nodeType !== 'cache' &&
        !selectedNode.data.label.toLowerCase().includes('redis'))
    ) {
      return;
    }
    const databaseNodeId: string = crypto.randomUUID();
    setNodes((prev: AtlasNode[]) => [
      ...prev,
      {
        id: databaseNodeId,
        type: 'atlas',
        position: {
          x: selectedNode.position.x,
          y: selectedNode.position.y + 180,
        },
        data: {
          label: 'PostgreSQL',
          nodeType: 'db',
        },
      },
    ]);
    setEdges((prev: Edge[]) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        source: selectedNode.id,
        target: databaseNodeId,
        label: 'fallback',
        type: DEFAULT_EDGE_TYPE,
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ]);
    setSelectedId(databaseNodeId);
    setSelectedEdgeId(null);
  }, [selectedNode, setEdges, setNodes]);

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
              setSelectedEdgeId(null);
            }}
            onEdgeClick={(_, edge: Edge): void => {
              setSelectedEdgeId(edge.id);
              setSelectedId(null);
            }}
            onPaneClick={(): void => {
              setSelectedId(null);
              setSelectedEdgeId(null);
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
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {t('diagrams.editor.nodeSettings')}
                </h2>
                <button
                  type="button"
                  onClick={deleteSelectedNode}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
                >
                  {t('diagrams.editor.deleteNode')}
                </button>
              </div>
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
                  <option value="cache">cache</option>
                  <option value="queue">queue</option>
                </select>
              </label>
              {selectedNode.data.nodeType === 'api' ? (
                <button
                  type="button"
                  onClick={addCacheAfterSelectedApi}
                  className="mt-3 w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  {t('diagrams.editor.suggestCacheLayer')}
                </button>
              ) : null}
              {selectedNode.data.nodeType === 'cache' ||
              selectedNode.data.label.toLowerCase().includes('redis') ? (
                <button
                  type="button"
                  onClick={addDatabaseAfterSelectedCache}
                  className="mt-3 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-left text-xs font-medium text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
                >
                  {t('diagrams.editor.suggestDatabaseFallback')}
                </button>
              ) : null}
            </section>
          ) : selectedEdge !== undefined ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {t('diagrams.editor.edgeSettings')}
                </h2>
                <button
                  type="button"
                  onClick={deleteSelectedEdge}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
                >
                  {t('diagrams.editor.deleteEdge')}
                </button>
              </div>
              <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {t('diagrams.editor.edgeLabel')}
                <input
                  type="text"
                  value={
                    selectedEdge.label === undefined
                      ? ''
                      : String(selectedEdge.label)
                  }
                  onChange={(e) => {
                    const value: string = e.target.value;
                    setEdges((prev: Edge[]) =>
                      prev.map((edge: Edge): Edge =>
                        edge.id === selectedEdgeId
                          ? {
                              ...edge,
                              label: value.trim().length === 0 ? undefined : value,
                            }
                          : edge,
                      ),
                    );
                  }}
                  placeholder={t('diagrams.editor.edgeLabelPlaceholder')}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {t('diagrams.editor.edgeKind')}
                <select
                  value={parseEdgeType(
                    typeof selectedEdge.type === 'string'
                      ? selectedEdge.type
                      : undefined,
                  )}
                  onChange={(e) => {
                    const value = e.target.value as AtlasEdgeType;
                    setEdges((prev: Edge[]) =>
                      prev.map((edge: Edge): Edge =>
                        edge.id === selectedEdgeId
                          ? {
                              ...edge,
                              type: value,
                              markerEnd: { type: MarkerType.ArrowClosed },
                            }
                          : edge,
                      ),
                    );
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="smoothstep">smoothstep</option>
                  <option value="straight">straight</option>
                  <option value="step">step</option>
                  <option value="default">default</option>
                </select>
              </label>
              <label className="mt-3 flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={selectedEdge.animated ?? false}
                  onChange={(e) => {
                    const checked: boolean = e.target.checked;
                    setEdges((prev: Edge[]) =>
                      prev.map((edge: Edge): Edge =>
                        edge.id === selectedEdgeId
                          ? { ...edge, animated: checked }
                          : edge,
                      ),
                    );
                  }}
                  className="h-4 w-4 rounded border-zinc-300 text-violet-600"
                />
                {t('diagrams.editor.edgeAnimated')}
              </label>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                {t('diagrams.editor.edgeDirectionHint')}
              </p>
            </section>
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
