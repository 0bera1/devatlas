import type { ReactNode } from 'react';

interface GraphNode {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly accent?: boolean;
}

const NODES: readonly GraphNode[] = [
  { id: 'api', label: 'API', x: 40, y: 60, accent: true },
  { id: 'cache', label: 'Cache', x: 240, y: 30 },
  { id: 'queue', label: 'Queue', x: 240, y: 170 },
  { id: 'worker', label: 'Worker', x: 400, y: 100 },
  { id: 'db', label: 'PostgreSQL', x: 110, y: 270 },
];

const EDGES: readonly [string, string][] = [
  ['api', 'cache'],
  ['api', 'queue'],
  ['cache', 'worker'],
  ['queue', 'worker'],
  ['api', 'db'],
  ['worker', 'db'],
];

const NODE_WIDTH = 130;
const NODE_HEIGHT = 44;

function center(node: GraphNode): { x: number; y: number } {
  return { x: node.x + NODE_WIDTH / 2, y: node.y + NODE_HEIGHT / 2 };
}

/** Ana sayfa görseli: bir sistemin birbirine bağlı düğümleri. Dekoratif olduğu için ekran okuyucuya gizlidir. */
export function LandingHeroGraph(): ReactNode {
  const byId: Map<string, GraphNode> = new Map(NODES.map((node) => [node.id, node]));

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
      <svg viewBox="0 0 540 340" className="h-auto w-full" aria-hidden="true">
        {EDGES.map(([from, to]) => {
          const a: GraphNode | undefined = byId.get(from);
          const b: GraphNode | undefined = byId.get(to);
          if (a === undefined || b === undefined) {
            return null;
          }
          const start = center(a);
          const end = center(b);
          return (
            <line
              key={`${from}-${to}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="var(--border)"
              strokeWidth={1.5}
            />
          );
        })}
        {NODES.map((node) => (
          <g key={node.id}>
            <rect
              x={node.x}
              y={node.y}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              rx={12}
              fill="var(--background)"
              stroke={node.accent === true ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={node.accent === true ? 2 : 1.5}
            />
            <text
              x={node.x + NODE_WIDTH / 2}
              y={node.y + NODE_HEIGHT / 2 + 5}
              textAnchor="middle"
              fontSize={15}
              fontWeight={600}
              fill="var(--foreground)"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
