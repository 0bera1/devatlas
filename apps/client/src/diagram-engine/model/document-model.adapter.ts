import type {
  DiagramDocumentModel,
  DiagramEdgeModel,
  DiagramMetadataModel,
  DiagramNodeDataModel,
  DiagramNodeModel,
  DiagramNodeType,
} from '@/diagram-engine/model/diagram-core.types';
import { mapRecordToEngineGraph } from '@/diagram-engine/core/diagram-record.adapter';
import { parseDiagramEdgeRouting } from '@/diagram-engine/edges/diagram-edge.constants';
import type { DiagramRecord } from '@/domains/diagram/diagramDomains';
import type {
  DiagramEdgeAppearance,
  DiagramEngineEdge,
  DiagramEngineGraph,
  DiagramEngineMetadata,
  DiagramEngineNode,
  DiagramStandardNodeData,
} from '@/diagram-engine/types/diagram-engine.types';

function engineMetadataToModel(
  meta: DiagramEngineMetadata,
): DiagramMetadataModel {
  return {
    version: meta.version,
    mode: meta.mode,
    layout: meta.layout,
    theme: meta.theme,
  };
}

function modelMetadataToEngine(
  meta: DiagramMetadataModel,
): DiagramEngineMetadata {
  return {
    version: meta.version,
    mode: meta.mode,
    layout: meta.layout,
    theme: meta.theme,
  };
}

function toNodeDataModel(data: DiagramStandardNodeData): DiagramNodeDataModel {
  return {
    title: data.title,
    description: data.description,
    markdown: data.markdown,
    tags: data.tags,
    status: data.status,
    icon: data.icon,
    color: data.color,
    relatedDiagramId: data.relatedDiagramId,
    metadata: data.metadata,
  };
}

function fromNodeDataModel(
  data: DiagramNodeDataModel,
  type: DiagramNodeType,
): DiagramStandardNodeData {
  return {
    type,
    title: data.title,
    description: data.description,
    markdown: data.markdown,
    tags: data.tags === undefined ? undefined : [...data.tags],
    status: data.status,
    icon: data.icon,
    color: data.color,
    relatedDiagramId: data.relatedDiagramId,
    metadata:
      data.metadata === undefined
        ? undefined
        : { ...data.metadata },
  };
}

function edgeAppearanceFromModel(e: DiagramEdgeModel): DiagramEdgeAppearance {
  if (e.animated === true) {
    return 'animated';
  }
  if (e.semanticType === 'dashed') {
    return 'dashed';
  }
  return 'default';
}

export function engineGraphToDocumentModel(
  graph: DiagramEngineGraph,
  timestamps: { readonly createdAt: string; readonly updatedAt: string },
): DiagramDocumentModel {
  const nodes: DiagramNodeModel[] = graph.nodes.map(
    (n: DiagramEngineNode): DiagramNodeModel => ({
      id: n.id,
      type: n.data.type,
      position: { x: n.position.x, y: n.position.y },
      width: n.width,
      height: n.height,
      data: toNodeDataModel(n.data),
    }),
  );
  const edges: DiagramEdgeModel[] = graph.edges.map(
    (e: DiagramEngineEdge): DiagramEdgeModel => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.appearance === 'animated',
      routing: e.routing,
      semanticType: e.semanticType,
      metadata: e.metadata,
    }),
  );
  return {
    id: graph.id,
    title: graph.title,
    description: graph.description,
    nodes,
    edges,
    metadata: engineMetadataToModel(graph.metadata),
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  };
}

export function documentModelToEngineGraph(
  doc: DiagramDocumentModel,
): DiagramEngineGraph {
  const nodes: DiagramEngineNode[] = doc.nodes.map(
    (n: DiagramNodeModel): DiagramEngineNode => ({
      id: n.id,
      position: { x: n.position.x, y: n.position.y },
      width: n.width,
      height: n.height,
      data: fromNodeDataModel(n.data, n.type),
    }),
  );
  const edges: DiagramEngineEdge[] = doc.edges.map(
    (e: DiagramEdgeModel): DiagramEngineEdge => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      routing: parseDiagramEdgeRouting(e.routing),
      appearance: edgeAppearanceFromModel(e),
      semanticType: e.semanticType,
      metadata: e.metadata,
    }),
  );
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    nodes,
    edges,
    metadata: modelMetadataToEngine(doc.metadata),
  };
}

export function diagramRecordToDocumentModel(
  record: DiagramRecord,
): DiagramDocumentModel {
  const graph: DiagramEngineGraph = mapRecordToEngineGraph(record);
  return engineGraphToDocumentModel(graph, {
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}
