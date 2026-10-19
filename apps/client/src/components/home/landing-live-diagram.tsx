'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { KnowledgeDiagramRecord } from '@/domains/knowledge/knowledgeDomains';
import { CHAPTERS, GRAPH_HEIGHT, GRAPH_WIDTH, NODE_HEIGHT, NODE_WIDTH, clamp01, segment, smoothstep } from '@/lib/landing/story-timeline';
import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';

const MAX_NODES = 14;
/** Düğümlerin belirmeye başladığı ve veri paketinin yolculuğa çıktığı ilerleme değerleri (demo bölümü). */
const REVEAL_START: number = CHAPTERS.demo[0];
const REVEAL_STEP = 0.004;
const WALK_START: number = CHAPTERS.demo[0] + 0.08;
const WALK_END = 0.98;
const PAD_X = NODE_WIDTH / 2 + 12;
const PAD_Y = NODE_HEIGHT / 2 + 12;

interface PlacedNode {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

interface PlacedEdge {
  readonly id: string;
  readonly from: PlacedNode;
  readonly to: PlacedNode;
  readonly label: string | null;
  readonly animated: boolean;
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
 * Bilgi tabanındaki gerçek bir diyagramın canlı önizlemesi. Kaydırdıkça düğümler belirir, ardından bir veri
 * paketi bağlantılar boyunca adım adım ilerler: okuyucu sayfayı kaydırarak diyagramı "çalıştırır".
 */
export function LandingLiveDiagram(props: LandingLiveDiagramProps): ReactNode {
  const { diagram, progress } = props;
  const { t } = useTranslations();
  const placed: PlacedNode[] = useMemo(() => placeNodes(diagram), [diagram]);
  const byId: Map<string, PlacedNode> = useMemo(() => new Map(placed.map((node) => [node.id, node])), [placed]);

  const edges: PlacedEdge[] = useMemo((): PlacedEdge[] => {
    const result: PlacedEdge[] = [];
    for (const edge of diagram.edges) {
      const from: PlacedNode | undefined = byId.get(edge.fromNodeId);
      const to: PlacedNode | undefined = byId.get(edge.toNodeId);
      if (from !== undefined && to !== undefined) {
        result.push({ id: edge.id, from, to, label: edge.label, animated: edge.animated });
      }
    }
    return result;
  }, [diagram, byId]);

  const revealOf = (index: number): number =>
    clamp01(segment(progress, REVEAL_START + index * REVEAL_STEP, REVEAL_START + index * REVEAL_STEP + 0.03));

  // Yürüyüş: her kenar bir adım. Kaydırma ilerledikçe paket sıradaki kenara geçer.
  const walk: number = segment(progress, WALK_START, WALK_END);
  const walking: boolean = walk > 0 && edges.length > 0;
  const scaled: number = walk * edges.length;
  const stepIndex: number = Math.min(edges.length - 1, Math.max(0, Math.floor(scaled)));
  const stepT: number = smoothstep(scaled - stepIndex);
  const current: PlacedEdge | undefined = edges[stepIndex];
  const packet = current !== undefined ? { x: current.from.x + (current.to.x - current.from.x) * stepT, y: current.from.y + (current.to.y - current.from.y) * stepT } : null;
  const activeNodeId: string | null = current !== undefined ? (stepT > 0.6 ? current.to.id : current.from.id) : null;

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
            const reveal: number = revealOf(index);
            const isCurrent: boolean = walking && index === stepIndex;
            const isVisited: boolean = walking && index < stepIndex;
            return (
              <path
                key={edge.id}
                d={`M ${edge.from.x} ${edge.from.y} L ${edge.to.x} ${edge.to.y}`}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - reveal}
                fill="none"
                stroke={isCurrent || isVisited ? 'var(--accent)' : edge.animated ? 'var(--accent)' : 'var(--border)'}
                strokeWidth={isCurrent ? 2.5 : 1.5}
                opacity={isVisited ? 0.6 : 1}
              />
            );
          })}

          {placed.map((node, index) => {
            const reveal: number = revealOf(index);
            const isActive: boolean = node.id === activeNodeId;
            return (
              <g key={node.id} opacity={reveal}>
                <rect
                  x={node.x - NODE_WIDTH / 2}
                  y={node.y - NODE_HEIGHT / 2}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={12}
                  fill={isActive ? 'var(--accent)' : 'var(--background)'}
                  stroke={isActive ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={600}
                  fill={isActive ? 'var(--background)' : 'var(--foreground)'}
                >
                  {node.label}
                </text>
              </g>
            );
          })}

          {packet !== null && walking ? (
            <g>
              <circle cx={packet.x} cy={packet.y} r={11} fill="var(--accent)" opacity={0.18} />
              <circle cx={packet.x} cy={packet.y} r={5} fill="var(--accent)" />
            </g>
          ) : null}
        </svg>
      </div>

      <div className="flex min-h-[44px] items-center justify-between gap-4 border-t border-[var(--border)] px-4 py-2.5 text-xs sm:px-5">
        {walking && current !== undefined ? (
          <>
            <span className="min-w-0 truncate text-[var(--foreground)]">
              {current.from.label} → {current.to.label}
              {current.label !== null && current.label.length > 0 ? <span className="text-[var(--muted)]"> · {current.label}</span> : null}
            </span>
            <span className="shrink-0 font-mono tabular-nums text-[var(--muted)]">
              {String(stepIndex + 1).padStart(2, '0')} / {String(edges.length).padStart(2, '0')}
            </span>
          </>
        ) : (
          <span className="text-[var(--muted)]">{t('home.story.scrollHint')}</span>
        )}
      </div>
    </div>
  );
}
