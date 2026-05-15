import type { KnowledgeDiagramRecord } from '@/domains/knowledge/knowledgeDomains';
import type { DiagramRecord } from '@/domains/diagram/diagramDomains';

/** Bilgi tabanı diyagramını mevcut diagram motoruna uyumlu kayda dönüştürür. */
export function mapKnowledgeDiagramToDiagramRecord(
  row: KnowledgeDiagramRecord,
): DiagramRecord {
  const now = row.updatedAt;
  return {
    id: row.id,
    title: row.title,
    ownerId: 'system',
    visibility: 'PUBLIC',
    viewerAccess: 'viewer',
    favoriteCount: 0,
    createdAt: row.createdAt,
    updatedAt: now,
    nodes: row.nodes.map((n) => ({
      id: n.id,
      diagramId: n.diagramId,
      label: n.label,
      type: n.type,
      x: n.x,
      y: n.y,
      width: n.width,
      height: n.height,
      relatedDiagramId: n.relatedDiagramId,
      extras: n.extras,
    })),
    edges: row.edges.map((e) => ({
      id: e.id,
      diagramId: e.diagramId,
      fromNodeId: e.fromNodeId,
      toNodeId: e.toNodeId,
      label: e.label,
      type:
        e.type === 'smoothstep' ||
        e.type === 'straight' ||
        e.type === 'step' ||
        e.type === 'default'
          ? e.type
          : null,
      animated: e.animated,
    })),
  };
}
