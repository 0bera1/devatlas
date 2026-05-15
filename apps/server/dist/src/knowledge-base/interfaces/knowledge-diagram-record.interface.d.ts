export interface KnowledgeDiagramNodeRecord {
    id: string;
    diagramId: string;
    label: string;
    type: string;
    x: number;
    y: number;
    width: number | null;
    height: number | null;
    relatedDiagramId: string | null;
    extras: unknown | null;
}
export interface KnowledgeDiagramEdgeRecord {
    id: string;
    diagramId: string;
    fromNodeId: string;
    toNodeId: string;
    label: string | null;
    type: string | null;
    animated: boolean;
}
export interface KnowledgeDiagramSummary {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    narrative: string | null;
    sortOrder: number;
    nodeCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface KnowledgeDiagramRecord extends KnowledgeDiagramSummary {
    nodes: KnowledgeDiagramNodeRecord[];
    edges: KnowledgeDiagramEdgeRecord[];
}
