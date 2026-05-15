export interface SeedDocumentInput {
    slug: string;
    title: string;
    summary: string;
    content: string;
    sortOrder: number;
}
export interface SeedDiagramNodeInput {
    id: string;
    label: string;
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    extras?: Record<string, unknown>;
}
export interface SeedDiagramEdgeInput {
    from: string;
    to: string;
    label?: string;
    type?: string;
    animated?: boolean;
}
export interface SeedDiagramInput {
    slug: string;
    title: string;
    description: string;
    narrativeTr?: string;
    narrativeEn?: string;
    sortOrder: number;
    nodes: SeedDiagramNodeInput[];
    edges: SeedDiagramEdgeInput[];
}
export interface SeedFlowStepInput {
    diagramSlug: string;
    label: string;
    narrativeTr?: string | null;
    narrativeEn?: string | null;
}
export interface SeedFlowInput {
    slug: string;
    title: string;
    description: string;
    narrativeTr?: string | null;
    narrativeEn?: string | null;
    sortOrder: number;
    steps: ReadonlyArray<SeedFlowStepInput>;
}
export interface SeedUserInput {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    birthDate: Date;
}
