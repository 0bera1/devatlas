'use client';

import type { DiagramEdgeSemanticType } from '@/diagram-engine/model/diagram-core.types';
import type { DiagramEngine } from '@/diagram-engine/core/diagram-engine';
import type { DiagramEngineEdge } from '@/diagram-engine/types/diagram-engine.types';
import type { DiagramEdgeKind } from '@/domains/diagramDomains';
import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';

export interface DiagramEdgeDetailPanelProps {
  readonly selectedEdge: DiagramEngineEdge;
  readonly selectedEdgeId: string;
  readonly engine: DiagramEngine;
  readonly onDeleteEdge: () => void;
}

export function DiagramEdgeDetailPanel(
  props: DiagramEdgeDetailPanelProps,
): ReactNode {
  const { selectedEdge, selectedEdgeId, engine, onDeleteEdge } = props;
  const { t } = useTranslations();

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('diagrams.editor.edgeSettings')}
        </h2>
        <button
          type="button"
          onClick={onDeleteEdge}
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
          onChange={(e): void => {
            const value: string = e.target.value;
            engine.updateEdge(selectedEdgeId, {
              label: value.trim().length === 0 ? undefined : value,
            });
          }}
          placeholder={t('diagrams.editor.edgeLabelPlaceholder')}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {t('diagrams.editor.edgeKind')}
        <select
          value={selectedEdge.routing}
          onChange={(e): void => {
            const value = e.target.value as DiagramEdgeKind;
            engine.updateEdge(selectedEdgeId, { routing: value });
          }}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="smoothstep">smoothstep</option>
          <option value="straight">straight</option>
          <option value="step">step</option>
          <option value="default">default</option>
        </select>
      </label>
      <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {t('diagrams.editor.edgeSemantic')}
        <select
          value={selectedEdge.semanticType ?? ''}
          onChange={(e): void => {
            const raw: string = e.target.value;
            if (raw === '') {
              engine.updateEdge(selectedEdgeId, {
                semanticType: undefined,
              });
              return;
            }
            engine.updateEdge(selectedEdgeId, {
              semanticType: raw as DiagramEdgeSemanticType,
            });
          }}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">{t('diagrams.editor.edgeSemanticNone')}</option>
          <option value="default">default</option>
          <option value="dashed">dashed</option>
          <option value="data-flow">data-flow</option>
          <option value="dependency">dependency</option>
          <option value="async">async</option>
        </select>
      </label>
      <label className="mt-3 flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={selectedEdge.appearance === 'animated'}
          onChange={(e): void => {
            const checked: boolean = e.target.checked;
            engine.updateEdge(selectedEdgeId, {
              appearance: checked ? 'animated' : 'default',
            });
          }}
          className="h-4 w-4 rounded border-zinc-300 text-violet-600"
        />
        {t('diagrams.editor.edgeAnimated')}
      </label>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        {t('diagrams.editor.edgeDirectionHint')}
      </p>
    </section>
  );
}
