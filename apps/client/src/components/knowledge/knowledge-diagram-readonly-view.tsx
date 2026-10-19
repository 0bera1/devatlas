'use client';

import '@xyflow/react/dist/style.css';

import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { isHttpNetworkError, isNotFoundHttpError } from '@/api/http/execute-request';
import { applyAtlasFlowPresentation } from '@/components/diagrams/flow/atlas-flow-presentation';
import { useAtlasDiagramNodeTypes } from '@/components/diagrams/flow/atlas-diagram-node-views';
import { DiagramCanvasHoverCard } from '@/components/diagrams/flow/diagram-canvas-hover-card';
import { DiagramCanvasToolbar } from '@/components/diagrams/flow/diagram-canvas-toolbar';
import { DiagramEdgeLabelsOverlay } from '@/components/diagrams/flow/diagram-edge-labels-overlay';
import { KnowledgeBackLink } from '@/components/knowledge/knowledge-back-link';
import { RelatedInterviewQuestions } from '@/components/knowledge/related-interview-questions';
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
    <div className="relative h-[min(76vh,680px)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
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
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="var(--border)" />
          <Controls showInteractive={false} />
          <DiagramCanvasToolbar selectedNodeId={selectedNodeId} isReadOnlyCanvas={isReadOnlyCanvas} />
          <DiagramCanvasHoverCard graph={graph} />
          <DiagramEdgeLabelsOverlay edges={presentedEdges} />
        </ReactFlow>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">{t('diagrams.editor.loading')}</div>
      )}
      {hydrated ? (
        <span className="pointer-events-none absolute right-4 top-4 z-10 rounded-full bg-[var(--surface)]/90 px-3 py-1 text-xs tabular-nums text-[var(--muted)] ring-1 ring-[var(--border)]">
          {graph.nodes.length} {t('knowledge.diagrams.nodesLabel')} · {graph.edges.length} {t('diagrams.editor.edgeSettings').toLocaleLowerCase()}
        </span>
      ) : null}
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
      <div className="h-[420px] animate-pulse rounded-2xl bg-[var(--border)]" />
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
        <KnowledgeBackLink className="text-sm font-medium underline" />
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--muted)]">
        <span className="flex min-w-0 items-center gap-2">
          <KnowledgeBackLink className="text-[var(--muted)] hover:text-[var(--foreground)]" />
          <span aria-hidden>/</span>
          <span className="truncate text-[var(--foreground)]">{record.title}</span>
        </span>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">{t('knowledge.readOnly')}</span>
      </div>
      <header className="flex flex-col gap-3">
        <p className="text-[13px] text-[var(--muted)]">{t('knowledge.interview.resourceKind.diagram')}</p>
        <h1 className="flex items-center gap-3 font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
          <span className="h-3 w-3 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
          {record.title}
        </h1>
        {data.description !== null && data.description.length > 0 ? (
          <p className="max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">{data.description}</p>
        ) : null}
      </header>
      {body}
      <RelatedInterviewQuestions questions={data.relatedInterviewQuestions} />
    </div>
  );
}
