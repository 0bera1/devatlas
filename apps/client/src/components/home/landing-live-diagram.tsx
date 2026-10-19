'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { KnowledgeDiagramRecord } from '@/domains/knowledge/knowledgeDomains';
import { GRAPH_HEIGHT, GRAPH_WIDTH, NODE_HEIGHT, NODE_WIDTH, segment, clamp01 } from '@/lib/landing/story-timeline';
import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';

const MAX_NODES = 14;
const REVEAL_START = 0.84;
const REVEAL_STEP = 0.008;
const PAD_X = NODE_WIDTH / 2 + 12;
const PAD_Y = NODE_HEIGHT / 2 + 12;

interface PlacedNode {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

/** Gerçek diyagram düğümlerini SVG kanvasına sığdırır. Koordinatlar veriden gelir; oranlar korunur. */
function placeNodes(diagram: KnowledgeDiagramRecord): PlacedNode[] {
  const nodes = diagram.nodes.slice(0, MAX_NODES);
  if (nodes.length === 0) {
    return [];
  }
  const minX: number = Math.min(...nodes.map((node) => node.x));
  const maxX: number = Math.max(...nodes.map((node) => node.x));
  const minY: number = Math.min(...nodes.map((node) => node.y));
  const maxY: number = Math.max(...nodes.map((node) => node.y));
  const spanX: number = Math.max(maxX - minX, 1);
  const spanY: number = Math.max(maxY - minY, 1);
  const usableW: number = GRAPH_WIDTH - PAD_X * 2;
  const usableH: number = GRAPH_HEIGHT - PAD_Y * 2;

  return nodes.map((node) => ({
    id: node.id,
    label: node.label.length > 18 ? `${node.label.slice(0, 17)}…` : node.label,
    x: PAD_X + ((node.x - minX) / spanX) * usableW,
    y: PAD_Y + ((node.y - minY) / spanY) * usableH,
  }));
}

export interface LandingLiveDiagramProps {
  readonly diagram: KnowledgeDiagramRecord;
  readonly progress: number;
}

/**
 * Bilgi tabanındaki gerçek bir diyagramın canlı önizlemesi. Düğümler ve bağlantılar kaydırdıkça sırayla
 * belirir; altındaki bağlantı ile tam diyagrama ve bilgi tabanına gidilir.
 */
export function LandingLiveDiagram(props: LandingLiveDiagramProps): ReactNode {
  const { diagram, progress } = props;
  const { t } = useTranslations();
  const placed: PlacedNode[] = useMemo(() => placeNodes(diagram), [diagram]);
  const byId: Map<string, PlacedNode> = useMemo(() => new Map(placed.map((node) => [node.id, node])), [placed]);
  const revealOf = (index: number): number =>
    clamp01(segment(progress, REVEAL_START + index * REVEAL_STEP, REVEAL_START + index * REVEAL_STEP + 0.03));

  const edges = diagram.edges.filter((edge) => byId.has(edge.fromNodeId) && byId.has(edge.toNodeId));

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" aria-hidden />
            {t('collaboration.canvasBadge')}
          </span>
          <p className="truncate font-serif text-base">{diagram.title}</p>
        </div>
        <Link href={`/knowledge/diagrams/${encodeURIComponent(diagram.slug)}`} className="shrink-0 text-xs font-medium text-[var(--muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline">
          {t('knowledge.title')} →
        </Link>
      </div>

      <div className="relative p-3 sm:p-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:18px_18px]"
          aria-hidden
        />
        <svg viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} className="relative h-auto w-full" aria-hidden="true">
          {edges.map((edge, index) => {
            const from: PlacedNode | undefined = byId.get(edge.fromNodeId);
            const to: PlacedNode | undefined = byId.get(edge.toNodeId);
            if (from === undefined || to === undefined) {
              return null;
            }
            const reveal: number = revealOf(index);
            return (
              <path
                key={edge.id}
                d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - reveal}
                fill="none"
                stroke={edge.animated ? 'var(--accent)' : 'var(--border)'}
                strokeWidth={1.5}
              />
            );
          })}

          {placed.map((node, index) => {
            const reveal: number = revealOf(index);
            return (
              <g key={node.id} opacity={reveal}>
                <rect
                  x={node.x - NODE_WIDTH / 2}
                  y={node.y - NODE_HEIGHT / 2}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={12}
                  fill="var(--background)"
                  stroke="var(--border)"
                  strokeWidth={1.5}
                />
                <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--foreground)">
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
