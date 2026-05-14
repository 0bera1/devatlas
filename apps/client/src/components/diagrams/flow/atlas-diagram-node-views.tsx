'use client';

import {
  Handle,
  type NodeProps,
  type NodeTypes,
  Position,
} from '@xyflow/react';
import { useDiagramEditorStore } from '@/diagram-engine/hooks/diagram-editor-store';
import { useTranslations } from '@/hooks/use-translations';
import type { AtlasFlowNode } from '@/diagram-engine/core/react-flow.adapter';
import { NODE_TYPE_STYLES } from '@/diagram-engine/nodes/atlas-node.constants';
import type {
  DiagramNodeStatus,
  DiagramNodeType,
} from '@/diagram-engine/model/diagram-core.types';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';

function statusDotClass(status: DiagramNodeStatus): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-500';
    case 'warning':
      return 'bg-amber-500';
    case 'error':
      return 'bg-red-500';
    case 'default':
      return 'bg-zinc-400';
    default: {
      const _e: never = status;
      return _e;
    }
  }
}

function AtlasDiagramNodeViewInner(
  props: NodeProps<AtlasFlowNode>,
): ReactNode {
  const { data, isConnectable, id, selected } = props;
  const setHoverNodeId = useDiagramEditorStore((s) => s.setHoverNodeId);
  const { t } = useTranslations();
  const style = NODE_TYPE_STYLES[data.type];
  const linkedDiagramId: string | undefined =
    data.relatedDiagramId !== undefined &&
    data.relatedDiagramId !== null &&
    data.relatedDiagramId.trim().length > 0
      ? data.relatedDiagramId.trim()
      : undefined;
  const subtitle: string | undefined =
    data.description !== undefined && data.description.trim().length > 0
      ? data.description.trim()
      : undefined;

  return (
    <div
      className={`relative min-w-[148px] max-w-[220px] rounded-xl border-2 bg-white px-3 py-2 shadow-md transition-shadow dark:bg-zinc-900 ${style.border} ${
        selected ? 'ring-2 ring-violet-500/80 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950' : ''
      } ${
        linkedDiagramId !== undefined
          ? 'shadow-[0_0_0_1px_rgba(139,92,246,0.35)] ring-1 ring-violet-400/60 dark:ring-violet-500/50'
          : ''
      }`}
      onMouseEnter={(): void => {
        setHoverNodeId(id);
      }}
      onMouseLeave={(): void => {
        setHoverNodeId(null);
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className={`!z-20 !h-3 !w-3 !border-2 !border-white dark:!border-zinc-900 ${style.accent}`}
      />
      {linkedDiagramId !== undefined ? (
        <span
          className="pointer-events-none absolute -right-1.5 -top-1.5 z-30 flex h-6 min-w-6 items-center justify-center rounded-full border border-violet-300 bg-gradient-to-br from-violet-600 to-fuchsia-600 px-1.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg shadow-violet-900/25"
          title={t('diagrams.editor.nodeLinkedBadgeTooltip')}
          aria-label={t('diagrams.editor.nodeLinkedBadgeTooltip')}
        >
          ↗
        </span>
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className={`!z-20 !h-3 !w-3 !border-2 !border-white dark:!border-zinc-900 ${style.accent}`}
      />
      <div className="flex items-center gap-2">
        <div
          className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
        >
          {data.type}
        </div>
        {data.status !== undefined && data.status !== 'default' ? (
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass(data.status)}`}
            title={data.status}
            aria-hidden
          />
        ) : null}
      </div>
      <div className="mt-1 line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {data.title}
      </div>
      {subtitle !== undefined ? (
        <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-600 dark:text-zinc-400">
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

const MemoAtlasNode = memo(AtlasDiagramNodeViewInner);

const ALL: readonly DiagramNodeType[] = [
  'text',
  'api',
  'service',
  'database',
  'cache',
  'queue',
  'external',
  'custom',
] as const;

/**
 * React Flow `nodeTypes` — RF `type` alanı motor `DiagramNodeType` ile birebir eşlenir.
 */
export function useAtlasDiagramNodeTypes(): NodeTypes {
  return useMemo((): NodeTypes => {
    const registry: Partial<Record<DiagramNodeType, typeof MemoAtlasNode>> = {};
    for (const t of ALL) {
      registry[t] = MemoAtlasNode;
    }
    return registry as NodeTypes;
  }, []);
}
