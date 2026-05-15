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
import { isHttpNetworkError, isNotFoundHttpError } from '@/api/http/execute-request';
import { applyAtlasFlowPresentation } from '@/components/diagrams/flow/atlas-flow-presentation';
import { useAtlasDiagramNodeTypes } from '@/components/diagrams/flow/atlas-diagram-node-views';
import { DiagramCanvasHoverCard } from '@/components/diagrams/flow/diagram-canvas-hover-card';
import { DiagramCanvasToolbar } from '@/components/diagrams/flow/diagram-canvas-toolbar';
import { DiagramEdgeLabelsOverlay } from '@/components/diagrams/flow/diagram-edge-labels-overlay';
import { KnowledgeNarrativeSection } from '@/components/knowledge/knowledge-narrative-section';
import { mapKnowledgeDiagramToDiagramRecord } from '@/diagram-engine/core/knowledge-diagram.adapter';
import {
  ATLAS_DEFAULT_EDGE_OPTIONS,
  type AtlasFlowNode,
} from '@/diagram-engine/core/react-flow.adapter';
import {
  DiagramEditorStoreProvider,
  useDiagramEditorStoreApi,
} from '@/diagram-engine/hooks/diagram-editor-store';
import { useDiagramEditorCanvas } from '@/diagram-engine/hooks/use-diagram-editor-canvas';
import { useDiagramEngine } from '@/diagram-engine/hooks/use-diagram-engine';
import type { DiagramRecord } from '@/domains/diagram/diagramDomains';
import { useKnowledgeDiagramQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useDiagramQueryHydration } from '@/hooks/diagram/use-diagram-query-hydration';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';

interface KnowledgeDiagramCanvasProps {
  readonly record: DiagramRecord;
}

function KnowledgeDiagramCanvas(props: KnowledgeDiagramCanvasProps): ReactNode {
  const { record } = props;
  const { t } = useTranslations();
  const engine = useDiagramEngine();
  const storeApi = useDiagramEditorStoreApi();

  useDiagramQueryHydration(record, record.id, engine);

  useEffect(() => {
    storeApi.getState().setEditorCanvasMode('view');
  }, [storeApi]);

  const {
    graph,
    selectedNodeId,
    selectedEdgeId,
    flowNodes,
    flowEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onViewportMoveEnd,
    hydrated,
  } = useDiagramEditorCanvas();

  const nodeTypes = useAtlasDiagramNodeTypes();
  const isReadOnlyCanvas = true;

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

  return (
    <div className="relative h-[min(70vh,560px)] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      {hydrated ? (
        <ReactFlow
          nodes={presentedNodes as AtlasFlowNode[]}
          edges={presentedEdges as Edge[]}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={ATLAS_DEFAULT_EDGE_OPTIONS}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onMoveEnd={onViewportMoveEnd}
          nodesDraggable={!isReadOnlyCanvas}
          nodesConnectable={!isReadOnlyCanvas}
          elementsSelectable
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable />
          <DiagramCanvasToolbar
            selectedNodeId={selectedNodeId}
            isReadOnlyCanvas={isReadOnlyCanvas}
          />
          <DiagramCanvasHoverCard graph={graph} />
          <DiagramEdgeLabelsOverlay edges={presentedEdges} />
        </ReactFlow>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
          {t('diagrams.editor.loading')}
        </div>
      )}
    </div>
  );
}

interface KnowledgeDiagramReadonlyViewProps {
  readonly slug: string;
  readonly showHeader?: boolean;
  readonly showNarrative?: boolean;
  readonly narrativeVariant?: 'default' | 'step';
}

export function KnowledgeDiagramReadonlyView(
  props: KnowledgeDiagramReadonlyViewProps,
): ReactNode {
  const {
    slug,
    showHeader = true,
    showNarrative = true,
    narrativeVariant = 'default',
  } = props;
  const { t } = useTranslations();
  const { data, isPending, isError, error } = useKnowledgeDiagramQuery(slug, true);

  const record: DiagramRecord | undefined = useMemo(() => {
    if (data === undefined) {
      return undefined;
    }
    return mapKnowledgeDiagramToDiagramRecord(data);
  }, [data]);

  if (isPending) {
    return (
      <div className="h-[420px] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  if (isError || record === undefined || data === undefined) {
    const msg: string =
      error !== null && isNotFoundHttpError(error)
        ? t('knowledge.diagram.notFound')
        : error !== null && isHttpNetworkError(error)
          ? t('errors.network')
          : (error?.message ?? t('knowledge.diagram.notFound'));
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-red-700 dark:text-red-300">{msg}</p>
        <Link href="/knowledge" className="text-sm font-medium underline">
          {t('knowledge.backToBase')}
        </Link>
      </div>
    );
  }

  const canvas: ReactNode = (
    <ReactFlowProvider>
      <DiagramEditorStoreProvider diagramId={record.id}>
        <KnowledgeDiagramCanvas record={record} />
      </DiagramEditorStoreProvider>
    </ReactFlowProvider>
  );

  const narrativeSection: ReactNode = showNarrative ? (
    <KnowledgeNarrativeSection
      narrative={data.narrative}
      variant={narrativeVariant === 'step' ? 'step' : 'default'}
    />
  ) : null;

  const body: ReactNode = (
    <div className="flex flex-col gap-6">
      {canvas}
      {narrativeSection}
    </div>
  );

  if (!showHeader) {
    return body;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/knowledge"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
        >
          {t('knowledge.backToBase')}
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          {record.title}
        </h1>
        {data.description !== null && data.description.length > 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {data.description}
          </p>
        ) : null}
        <span className="inline-flex w-fit rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800">
          {t('knowledge.readOnly')}
        </span>
      </header>
      {body}
    </div>
  );
}
