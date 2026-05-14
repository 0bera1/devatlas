import type {
  DiagramEngineEdge,
  DiagramEngineGraph,
  DiagramEngineNode,
} from '@/diagram-engine/types/diagram-engine.types';
export interface DiagramValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly edgeId?: string;
  readonly nodeId?: string;
}

function isFiniteNumber(n: number): boolean {
  return typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n);
}

/**
 * Motor grafiği tutarlılık kontrolü (benzersiz id, kenar uçları, pozisyon).
 * Hata fırlatmaz; sorun listesi döner.
 */
export function validateEngineDiagram(
  graph: DiagramEngineGraph,
): readonly DiagramValidationIssue[] {
  const issues: DiagramValidationIssue[] = [];
  const nodeIds = new Set<string>();
  for (const n of graph.nodes) {
    if (nodeIds.has(n.id)) {
      issues.push({
        code: 'DUPLICATE_NODE_ID',
        message: `Yinelenen düğüm id: ${n.id}`,
        nodeId: n.id,
      });
    }
    nodeIds.add(n.id);
    if (!isFiniteNumber(n.position.x) || !isFiniteNumber(n.position.y)) {
      issues.push({
        code: 'INVALID_NODE_POSITION',
        message: `Geçersiz pozisyon: ${n.id}`,
        nodeId: n.id,
      });
    }
  }
  for (const e of graph.edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) {
      issues.push({
        code: 'INVALID_EDGE_ENDPOINT',
        message: `Kenar uçları geçersiz: ${e.id} (${e.source} → ${e.target})`,
        edgeId: e.id,
      });
    }
  }
  return issues;
}

export function assertEngineDiagramValid(graph: DiagramEngineGraph): void {
  const issues: readonly DiagramValidationIssue[] = validateEngineDiagram(graph);
  if (issues.length === 0) {
    return;
  }
  const msg: string = issues.map((i) => `${i.code}: ${i.message}`).join('; ');
  throw new Error(`Diagram doğrulama hatası: ${msg}`);
}

export function findUnreachableNodes(
  graph: DiagramEngineGraph,
): readonly string[] {
  if (graph.nodes.length === 0) {
    return [];
  }
  const touched = new Set<string>();
  for (const e of graph.edges) {
    touched.add(e.source);
    touched.add(e.target);
  }
  return graph.nodes
    .map((n: DiagramEngineNode) => n.id)
    .filter((id: string) => !touched.has(id));
}

export function findDanglingEdges(
  graph: DiagramEngineGraph,
): readonly DiagramEngineEdge[] {
  const nodeIds = new Set<string>(graph.nodes.map((n) => n.id));
  return graph.edges.filter(
    (e: DiagramEngineEdge) =>
      !nodeIds.has(e.source) || !nodeIds.has(e.target),
  );
}
