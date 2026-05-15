export interface DiagramNodeRecord {
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
