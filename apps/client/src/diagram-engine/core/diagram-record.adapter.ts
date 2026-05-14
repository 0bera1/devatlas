import type {

  DiagramRecord,

  SaveDiagramGraphBody,

} from '@/domains/diagramDomains';

import {

  mapRecordAnimatedToAppearance,

  parseDiagramEdgeRouting,

} from '@/diagram-engine/edges/diagram-edge.constants';

import { normalizeDiagramRecordWireTypes } from '@/diagram-engine/model/migrate-diagram-record';

import { validateEngineDiagram } from '@/diagram-engine/model/validate-engine-diagram';

import { parseDiagramNodeType } from '@/diagram-engine/nodes/atlas-node.constants';

import type {

  DiagramEngineGraph,

  DiagramEngineMetadata,

  DiagramEngineNode,

  DiagramEngineEdge,

  DiagramStandardNodeData,

} from '@/diagram-engine/types/diagram-engine.types';

import type { DiagramNodeStatus } from '@/diagram-engine/model/diagram-core.types';

const NODE_STATUS_VALUES: readonly DiagramNodeStatus[] = [
  'default',
  'active',
  'warning',
  'error',
];

function isWireNodeStatus(value: unknown): value is DiagramNodeStatus {
  return (
    typeof value === 'string' &&
    (NODE_STATUS_VALUES as readonly string[]).includes(value)
  );
}

function diagramNodeExtrasFingerprint(raw: unknown): string {
  if (raw === undefined || raw === null) {
    return '';
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return '';
  }
  return JSON.stringify(raw);
}

function readWireNodeExtras(raw: unknown): Partial<DiagramStandardNodeData> {
  const acc: Record<string, unknown> = {};
  if (raw === null || raw === undefined || typeof raw !== 'object' || Array.isArray(raw)) {
    return acc as Partial<DiagramStandardNodeData>;
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.description === 'string') {
    acc.description = o.description;
  }
  if (typeof o.markdown === 'string') {
    acc.markdown = o.markdown;
  }
  if (Array.isArray(o.tags)) {
    const tags: string[] = o.tags.filter((t): t is string => typeof t === 'string');
    if (tags.length > 0) {
      acc.tags = tags;
    }
  }
  if (isWireNodeStatus(o.status)) {
    acc.status = o.status;
  }
  if (typeof o.icon === 'string') {
    acc.icon = o.icon;
  }
  if (typeof o.color === 'string') {
    acc.color = o.color;
  }
  if (
    typeof o.metadata === 'object' &&
    o.metadata !== null &&
    !Array.isArray(o.metadata)
  ) {
    acc.metadata = { ...(o.metadata as Record<string, unknown>) };
  }
  return acc as Partial<DiagramStandardNodeData>;
}

function buildWireNodeExtras(n: DiagramEngineNode): Record<string, unknown> | null {
  const d = n.data;
  const o: Record<string, unknown> = {};
  if (d.description !== undefined && d.description.trim().length > 0) {
    o.description = d.description.trim();
  }
  if (d.markdown !== undefined && d.markdown.trim().length > 0) {
    o.markdown = d.markdown.trim();
  }
  if (d.tags !== undefined && d.tags.length > 0) {
    o.tags = [...d.tags];
  }
  if (d.status !== undefined) {
    o.status = d.status;
  }
  if (d.icon !== undefined && d.icon.trim().length > 0) {
    o.icon = d.icon.trim();
  }
  if (d.color !== undefined && d.color.trim().length > 0) {
    o.color = d.color.trim();
  }
  if (d.metadata !== undefined && Object.keys(d.metadata).length > 0) {
    o.metadata = { ...d.metadata };
  }
  return Object.keys(o).length === 0 ? null : o;
}



const DEFAULT_METADATA: DiagramEngineMetadata = {

  version: 1,

  mode: 'simple',

  layout: 'free',

};



export function createEmptyEngineGraph(diagramId: string): DiagramEngineGraph {

  return {

    id: diagramId,

    title: '',

    description: undefined,

    nodes: [],

    edges: [],

    metadata: DEFAULT_METADATA,

  };

}



/**

 * Sunucu kaydındaki diyagram gövdesi (düğüm/kenar + meta) değişmediyse aynı parmak izi döner.

 * Görünürlük / başlık gibi alanları da kapsar; yalnızca `updatedAt` oynaması yerel grafiği sıfırlamayı engeller.

 */

export function getDiagramRecordSyncFingerprint(record: DiagramRecord): string {

  const nodePart: string = [...record.nodes]

    .sort((a, b) => a.id.localeCompare(b.id))

    .map(

      (n) =>

        `${n.id}:${n.x}:${n.y}:${n.label}:${n.type}:${String(n.width)}:${String(n.height)}:${n.relatedDiagramId ?? ''}:${diagramNodeExtrasFingerprint(n.extras)}`,

    )

    .join('|');

  const edgePart: string = [...record.edges]

    .sort((a, b) => a.id.localeCompare(b.id))

    .map(

      (e) =>

        `${e.id}:${e.fromNodeId}:${e.toNodeId}:${e.label ?? ''}:${String(e.type)}:${e.animated ? 1 : 0}`,

    )

    .join('|');

  return `${record.id}:${record.title}:${record.visibility}:${nodePart}:${edgePart}`;

}



export function mapRecordToEngineGraph(record: DiagramRecord): DiagramEngineGraph {

  const normalized: DiagramRecord = normalizeDiagramRecordWireTypes(record);

  const nodes: DiagramEngineNode[] = normalized.nodes.map(

    (n): DiagramEngineNode => ({

      id: n.id,

      position: { x: n.x, y: n.y },

      width: n.width ?? undefined,

      height: n.height ?? undefined,

      data: {

        title: n.label,

        type: parseDiagramNodeType(n.type),

        relatedDiagramId:
          n.relatedDiagramId !== undefined &&
          n.relatedDiagramId !== null &&
          String(n.relatedDiagramId).trim().length > 0
            ? String(n.relatedDiagramId).trim()
            : undefined,

        ...readWireNodeExtras(n.extras ?? null),

      },

    }),

  );



  const edges: DiagramEngineEdge[] = normalized.edges.map(

    (e): DiagramEngineEdge => ({

      id: e.id,

      source: e.fromNodeId,

      target: e.toNodeId,

      label: e.label ?? undefined,

      routing: parseDiagramEdgeRouting(e.type),

      appearance: mapRecordAnimatedToAppearance(e.animated),

    }),

  );



  const graph: DiagramEngineGraph = {

    id: normalized.id,

    title: normalized.title,

    description: undefined,

    nodes,

    edges,

    metadata: DEFAULT_METADATA,

  };



  if (process.env.NODE_ENV === 'development') {

    const issues: readonly { readonly code: string; readonly message: string }[] =

      validateEngineDiagram(graph);

    if (issues.length > 0) {
      console.warn('[diagram-engine] validateEngineDiagram', issues);
    }

  }



  return graph;

}



export function mapEngineGraphToSaveBody(

  graph: DiagramEngineGraph,

): SaveDiagramGraphBody {

  return {

    nodes: graph.nodes.map((n) => {

      const extras: Record<string, unknown> | null = buildWireNodeExtras(n);

      return {

      id: n.id,

      label:

        n.data.title.trim().length > 0 ? n.data.title.trim() : '…',

      type: n.data.type,

      x: n.position.x,

      y: n.position.y,

      width: n.width ?? null,

      height: n.height ?? null,

      relatedDiagramId:
        n.data.relatedDiagramId !== undefined &&
        n.data.relatedDiagramId !== null &&
        String(n.data.relatedDiagramId).trim().length > 0
          ? String(n.data.relatedDiagramId).trim()
          : null,

      extras,

    };

    }),

    edges: graph.edges.map((e) => ({

      from: e.source,

      to: e.target,

      label:

        e.label !== undefined && e.label.trim().length > 0

          ? e.label.trim()

          : undefined,

      type: parseDiagramEdgeRouting(e.routing),

      animated: e.appearance === 'animated',

    })),

  };

}



export function mergeEngineGraph(

  base: DiagramEngineGraph,

  patch: Partial<

    Pick<

      DiagramEngineGraph,

      'title' | 'description' | 'nodes' | 'edges' | 'metadata'

    >

  >,

): DiagramEngineGraph {

  return {

    id: base.id,

    title: patch.title ?? base.title,

    description: patch.description ?? base.description,

    nodes: patch.nodes ?? base.nodes,

    edges: patch.edges ?? base.edges,

    metadata: patch.metadata ?? base.metadata,

  };

}


