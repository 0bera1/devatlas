import type { DiagramNodeKind } from '@/domains/diagramDomains';
import type { DiagramNodeType } from '@/diagram-engine/model/diagram-core.types';

/** API genelde null döner; XYFlow 12 görünürlük/ölçüm için başlangıç boyutu gerekir. */
export const ATLAS_NODE_DEFAULT_WIDTH = 176;
export const ATLAS_NODE_DEFAULT_HEIGHT = 88;

export const ATLAS_REACT_FLOW_NODE_TYPE = 'atlas' as const;

export type AtlasReactFlowNodeType = typeof ATLAS_REACT_FLOW_NODE_TYPE;

export const NODE_TYPE_STYLES: Record<
  DiagramNodeType,
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
  database: {
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
  external: {
    border: 'border-orange-300 dark:border-orange-800',
    badge:
      'bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-200',
    accent: 'bg-orange-500',
  },
  custom: {
    border: 'border-slate-300 dark:border-slate-600',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    accent: 'bg-slate-500',
  },
};

export function parseDiagramNodeType(raw: string): DiagramNodeType {
  switch (raw) {
    case 'api':
    case 'service':
    case 'cache':
    case 'queue':
    case 'text':
    case 'external':
    case 'custom':
    case 'database':
      return raw;
    case 'db':
      return 'database';
    default:
      return 'text';
  }
}

/** @deprecated parseDiagramNodeType kullanın */
export function parseDiagramNodeKind(raw: string): DiagramNodeKind {
  return parseDiagramNodeType(raw);
}
