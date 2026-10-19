/**
 * Ana sayfa kaydırma hikâyesinin zaman çizelgesi. Tüm fonksiyonlar saftır; ilerleme (0 ile 1 arası)
 * bir kaydırma konumundan gelir ve tarayıcıya bağlı değildir.
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

export const GRAPH_WIDTH = 600;
export const GRAPH_HEIGHT = 400;
export const NODE_WIDTH = 124;
export const NODE_HEIGHT = 40;

export interface StoryNode {
  readonly id: string;
  readonly label: string;
  /** Dağınık haldeki merkez noktası. */
  readonly scatter: Point;
  /** Düzenli mimaridaki merkez noktası. */
  readonly layout: Point;
  readonly accent: boolean;
}

export const STORY_NODES: readonly StoryNode[] = [
  { id: 'api', label: 'API', scatter: { x: 300, y: 24 }, layout: { x: 70, y: 200 }, accent: true },
  { id: 'cache', label: 'Cache', scatter: { x: 70, y: 318 }, layout: { x: 240, y: 100 }, accent: false },
  { id: 'queue', label: 'Queue', scatter: { x: 456, y: 318 }, layout: { x: 240, y: 300 }, accent: false },
  { id: 'worker', label: 'Worker', scatter: { x: 96, y: 70 }, layout: { x: 410, y: 200 }, accent: false },
  { id: 'store', label: 'Store', scatter: { x: 400, y: 24 }, layout: { x: 530, y: 100 }, accent: false },
  { id: 'search', label: 'Search', scatter: { x: 260, y: 330 }, layout: { x: 530, y: 300 }, accent: false },
];

export const STORY_EDGES: readonly (readonly [string, string])[] = [
  ['api', 'cache'],
  ['api', 'queue'],
  ['cache', 'worker'],
  ['queue', 'worker'],
  ['worker', 'store'],
  ['worker', 'search'],
];

/** Özellik sırasına göre vurgulanan düğümler (home.story.feature1..4). */
export const FEATURE_NODE_IDS: readonly string[] = ['api', 'cache', 'worker', 'queue'];

/** Hikâyenin bölüm aralıkları (ilerleme ölçeğinde). */
export const CHAPTERS = {
  hero: [-0.2, 0.16],
  problem: [0.16, 0.36],
  transition: [0.36, 0.56],
  features: [0.56, 0.84],
  demo: [0.84, 1.2],
} as const;

export const FEATURE_COUNT: number = FEATURE_NODE_IDS.length;

export function featureRange(index: number): readonly [number, number] {
  const [start, end] = CHAPTERS.features;
  const span: number = (end - start) / FEATURE_COUNT;
  return [start + span * index, start + span * (index + 1)];
}

export function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

/** progress değerinin [start, end] aralığındaki normalize konumu (0 ile 1 arası). */
export function segment(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

export function smoothstep(t: number): number {
  const x: number = clamp01(t);
  return x * x * (3 - 2 * x);
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Bir bölümün görünürlüğü: giriş ve çıkışta yumuşak geçiş, dışında 0. */
export function chapterOpacity(progress: number, start: number, end: number, fade: number = 0.05): number {
  if (progress < start || progress > end) {
    return 0;
  }
  const fadeIn: number = segment(progress, start, start + fade);
  const fadeOut: number = segment(progress, end - fade, end);
  return Math.min(fadeIn, 1 - fadeOut);
}

export interface GraphNodeFrame {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly accent: boolean;
  readonly opacity: number;
  readonly highlighted: boolean;
}

export interface GraphEdgeFrame {
  readonly from: string;
  readonly to: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  /** Kenarın çizilme oranı (0 ile 1). */
  readonly draw: number;
  readonly highlighted: boolean;
}

export interface CursorFrame {
  readonly x: number;
  readonly y: number;
  readonly opacity: number;
}

export interface GraphFrame {
  readonly nodes: readonly GraphNodeFrame[];
  readonly edges: readonly GraphEdgeFrame[];
  readonly cursors: readonly CursorFrame[];
}

/** Hangi özellik bölümündeyiz; kapsam dışındaysa -1. */
export function activeFeatureIndex(progress: number): number {
  for (let index = 0; index < FEATURE_COUNT; index += 1) {
    const [start, end] = featureRange(index);
    if (progress >= start && progress < end) {
      return index;
    }
  }
  return progress >= CHAPTERS.features[1] && progress <= 1 ? FEATURE_COUNT - 1 : -1;
}

/** Düğüm ve kenar konumlarını hikâyenin o anki ilerlemesine göre hesaplar. */
export function computeGraphFrame(progress: number): GraphFrame {
  const organize: number = smoothstep(segment(progress, 0.3, 0.5));
  const drawEdges: number = segment(progress, 0.42, 0.6);
  const featureIndex: number = activeFeatureIndex(progress);
  const highlightedId: string | null = featureIndex >= 0 ? (FEATURE_NODE_IDS[featureIndex] ?? null) : null;
  const cursorVisible: number = segment(progress, 0.84, 0.9);
  const cursorT: number = smoothstep(segment(progress, 0.84, 1));

  const positions: Map<string, Point> = new Map();
  const nodes: GraphNodeFrame[] = STORY_NODES.map((node: StoryNode): GraphNodeFrame => {
    const point: Point = {
      x: lerp(node.scatter.x, node.layout.x, organize),
      y: lerp(node.scatter.y, node.layout.y, organize),
    };
    positions.set(node.id, point);
    return {
      id: node.id,
      label: node.label,
      x: point.x,
      y: point.y,
      accent: node.accent,
      opacity: 0.4 + 0.6 * organize,
      highlighted: node.id === highlightedId,
    };
  });

  const edges: GraphEdgeFrame[] = STORY_EDGES.map(([from, to]): GraphEdgeFrame => {
    const a: Point = positions.get(from) ?? { x: 0, y: 0 };
    const b: Point = positions.get(to) ?? { x: 0, y: 0 };
    return {
      from,
      to,
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      draw: drawEdges,
      highlighted: highlightedId !== null && (from === highlightedId || to === highlightedId),
    };
  });

  // İki imleç, son bölümde iki farklı kenar üzerinde akar.
  const cursorEdges: readonly number[] = [1, 4];
  const cursors: CursorFrame[] = cursorEdges.map((edgeIndex: number): CursorFrame => {
    const edge: GraphEdgeFrame | undefined = edges[edgeIndex];
    if (edge === undefined) {
      return { x: 0, y: 0, opacity: 0 };
    }
    return {
      x: lerp(edge.x1, edge.x2, cursorT),
      y: lerp(edge.y1, edge.y2, cursorT),
      opacity: cursorVisible,
    };
  });

  return { nodes, edges, cursors };
}
