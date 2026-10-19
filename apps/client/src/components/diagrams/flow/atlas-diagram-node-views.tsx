'use client';

import {
  Handle,
  type NodeProps,
  type NodeTypes,
  Position,
} from '@xyflow/react';
import { useDiagramEditorStore } from '@/diagram-engine/hooks/diagram-editor-store';
import { useTranslations } from '@/hooks/i18n/use-translations';
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
      return 'bg-[var(--muted)]';
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

  // Tasarım: nötr yüzey, ince kenarlık, küçük büyük harfli tür etiketi ve serif başlık. Seçili düğüm koyu kenarlıkla belirir.
  return (
    <div
      className={`relative min-w-[160px] max-w-[230px] rounded-xl bg-[var(--surface)] px-4 py-3 transition-[border-color,box-shadow] ${
        selected ? 'border-2 border-[var(--foreground)] shadow-md' : 'border border-[var(--border)] shadow-sm'
      } ${linkedDiagramId !== undefined && !selected ? 'border-[var(--accent)]' : ''}`}
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
        className="!z-20 !h-2.5 !w-2.5 !border-2 !border-[var(--surface)] !bg-[var(--foreground)]"
      />
      {linkedDiagramId !== undefined ? (
        <span
          className="pointer-events-none absolute -right-2 -top-2 z-30 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-[var(--background)] shadow"
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
        className="!z-20 !h-2.5 !w-2.5 !border-2 !border-[var(--surface)] !bg-[var(--foreground)]"
      />
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.accent}`} aria-hidden />
        {/* Tür adı İngilizce bir koddur; Türkçe büyük harf kuralı "İ" üretmesin diye dil ayrıca belirtilir. */}
        <span lang="en" className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          {data.type}
        </span>
        {data.status !== undefined && data.status !== 'default' ? (
          <span className={`ml-auto h-2 w-2 shrink-0 rounded-full ${statusDotClass(data.status)}`} title={data.status} aria-hidden />
        ) : null}
      </div>
      <div className="mt-1 line-clamp-2 font-serif text-[19px] leading-tight text-[var(--foreground)]">{data.title}</div>
      {subtitle !== undefined ? (
        <div className="mt-1.5 line-clamp-2 font-mono text-[11px] leading-snug text-[var(--muted)]">{subtitle}</div>
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
