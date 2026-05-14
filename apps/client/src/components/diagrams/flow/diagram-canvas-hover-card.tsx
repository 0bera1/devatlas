'use client';

import { useDiagramEditorStore } from '@/diagram-engine/hooks/diagram-editor-store';
import type { DiagramEngineGraph } from '@/diagram-engine/types/diagram-engine.types';
import type { DiagramEngineNode } from '@/diagram-engine/types/diagram-engine.types';
import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export interface DiagramCanvasHoverCardProps {
  readonly graph: DiagramEngineGraph;
}

export function DiagramCanvasHoverCard(
  props: DiagramCanvasHoverCardProps,
): ReactNode {
  const { graph } = props;
  const { t } = useTranslations();
  const hoverNodeId = useDiagramEditorStore((s) => s.hoverNodeId);
  const selectedNodeId = useDiagramEditorStore((s) => s.selectedNodeId);

  const node: DiagramEngineNode | undefined = useMemo(() => {
    if (hoverNodeId === null) {
      return undefined;
    }
    return graph.nodes.find((n) => n.id === hoverNodeId);
  }, [graph.nodes, hoverNodeId]);

  if (node === undefined || hoverNodeId === selectedNodeId) {
    return null;
  }

  const tags: readonly string[] | undefined = node.data.tags;

  return (
    <div
      className="pointer-events-none absolute bottom-12 left-3 z-20 max-w-[min(100%,280px)] rounded-xl border border-zinc-200 bg-white/95 p-3 text-left shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95"
      role="status"
      aria-live="polite"
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
        {t('diagrams.editor.hoverPreview')}
      </p>
      <h3 className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {node.data.title}
      </h3>
      {node.data.description !== undefined &&
      node.data.description.trim().length > 0 ? (
        <p className="mt-1 line-clamp-3 text-xs text-zinc-600 dark:text-zinc-400">
          {node.data.description.trim()}
        </p>
      ) : null}
      {tags !== undefined && tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
