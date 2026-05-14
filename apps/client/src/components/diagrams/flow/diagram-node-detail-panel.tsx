'use client';

import { MarkdownSafePreview } from '@/components/diagrams/flow/markdown-safe-preview';
import type { DiagramEngine } from '@/diagram-engine/core/diagram-engine';
import type { DiagramNodeStatus } from '@/diagram-engine/model/diagram-core.types';
import type { DiagramEngineNode } from '@/diagram-engine/types/diagram-engine.types';
import type { DiagramNodeKind } from '@/domains/diagramDomains';
import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const ATLAS_NODE_DETAIL_PANEL_DOM_ID = 'atlas-node-detail-panel' as const;

export interface DiagramNodeDetailPanelProps {
  readonly selectedNode: DiagramEngineNode;
  readonly selectedNodeId: string;
  readonly engine: DiagramEngine;
  readonly onSuggestCache: () => void;
  readonly onSuggestDatabase: () => void;
  readonly onDeleteNode: () => void;
}

function tagsToInput(tags: readonly string[] | undefined): string {
  if (tags === undefined || tags.length === 0) {
    return '';
  }
  return tags.join(', ');
}

function parseTagsInput(raw: string): readonly string[] | undefined {
  const parts: string[] = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length === 0) {
    return undefined;
  }
  return parts;
}

export function DiagramNodeDetailPanel(
  props: DiagramNodeDetailPanelProps,
): ReactNode {
  const {
    selectedNode,
    selectedNodeId,
    engine,
    onSuggestCache,
    onSuggestDatabase,
    onDeleteNode,
  } = props;
  const { t } = useTranslations();
  const md: string = selectedNode.data.markdown ?? '';
  const related: string = selectedNode.data.relatedDiagramId ?? '';
  const relatedTrim: string = related.trim();
  const relatedHref: string = `/diagrams/${encodeURIComponent(relatedTrim)}`;

  return (
    <section
      id={ATLAS_NODE_DETAIL_PANEL_DOM_ID}
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('diagrams.editor.nodeDetailTitle')}
        </h2>
        <button
          type="button"
          onClick={onDeleteNode}
          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
        >
          {t('diagrams.editor.deleteNode')}
        </button>
      </div>

      <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {t('diagrams.editor.nodeLabel')}
        <input
          type="text"
          value={selectedNode.data.title}
          onChange={(e): void => {
            engine.updateNodeData(selectedNodeId, { title: e.target.value });
          }}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {t('diagrams.editor.nodeDescription')}
        <textarea
          rows={3}
          value={
            selectedNode.data.description === undefined
              ? ''
              : selectedNode.data.description
          }
          onChange={(e): void => {
            const v: string = e.target.value;
            engine.updateNodeData(selectedNodeId, {
              description: v.trim().length === 0 ? undefined : v,
            });
          }}
          className="mt-1 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {t('diagrams.editor.nodeMarkdown')}
        <textarea
          rows={5}
          value={md}
          onChange={(e): void => {
            const v: string = e.target.value;
            engine.updateNodeData(selectedNodeId, {
              markdown: v.trim().length === 0 ? undefined : v,
            });
          }}
          className="mt-1 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      {md.trim().length > 0 ? (
        <div className="mt-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t('diagrams.editor.nodeMarkdownPreview')}
          </p>
          <MarkdownSafePreview content={md} />
        </div>
      ) : null}

      <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {t('diagrams.editor.nodeTags')}
        <input
          type="text"
          value={tagsToInput(selectedNode.data.tags)}
          onChange={(e): void => {
            engine.updateNodeData(selectedNodeId, {
              tags: parseTagsInput(e.target.value),
            });
          }}
          placeholder={t('diagrams.editor.nodeTagsPlaceholder')}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {t('diagrams.editor.nodeStatus')}
        <select
          value={selectedNode.data.status ?? 'default'}
          onChange={(e): void => {
            const v = e.target.value as DiagramNodeStatus;
            engine.updateNodeData(selectedNodeId, {
              status: v === 'default' ? undefined : v,
            });
          }}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="default">{t('diagrams.editor.nodeStatusDefault')}</option>
          <option value="active">{t('diagrams.editor.nodeStatusActive')}</option>
          <option value="warning">{t('diagrams.editor.nodeStatusWarning')}</option>
          <option value="error">{t('diagrams.editor.nodeStatusError')}</option>
        </select>
      </label>

      <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {t('diagrams.editor.relatedDiagramId')}
        <input
          type="text"
          value={related}
          onChange={(e): void => {
            const v: string = e.target.value;
            engine.updateNodeData(selectedNodeId, {
              relatedDiagramId: v.trim().length === 0 ? undefined : v.trim(),
            });
          }}
          placeholder={t('diagrams.editor.relatedDiagramPlaceholder')}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      {relatedTrim.length > 0 ? (
        <Link
          href={relatedHref}
          className="mt-2 inline-block text-xs font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-400"
        >
          {t('diagrams.editor.relatedDiagramOpen')}
        </Link>
      ) : null}

      <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {t('diagrams.editor.nodeKind')}
        <select
          value={selectedNode.data.type}
          onChange={(e): void => {
            const v = e.target.value as DiagramNodeKind;
            engine.updateNodeData(selectedNodeId, { type: v });
          }}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="text">text</option>
          <option value="database">database</option>
          <option value="service">service</option>
          <option value="api">api</option>
          <option value="cache">cache</option>
          <option value="queue">queue</option>
          <option value="external">external</option>
          <option value="custom">custom</option>
        </select>
      </label>

      {selectedNode.data.type === 'api' ? (
        <button
          type="button"
          onClick={onSuggestCache}
          className="mt-3 w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
        >
          {t('diagrams.editor.suggestCacheLayer')}
        </button>
      ) : null}
      {selectedNode.data.type === 'cache' ||
      selectedNode.data.title.toLowerCase().includes('redis') ? (
        <button
          type="button"
          onClick={onSuggestDatabase}
          className="mt-3 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-left text-xs font-medium text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
        >
          {t('diagrams.editor.suggestDatabaseFallback')}
        </button>
      ) : null}
    </section>
  );
}
