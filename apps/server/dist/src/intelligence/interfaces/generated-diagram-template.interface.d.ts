export interface GeneratedDiagramNode {
    readonly localId: string;
    readonly label: string;
    readonly type: 'text' | 'db' | 'service' | 'api' | 'cache' | 'queue';
    readonly x: number;
    readonly y: number;
    readonly width?: number | null;
    readonly height?: number | null;
}
export interface GeneratedDiagramEdge {
    readonly fromLocalId: string;
    readonly toLocalId: string;
    readonly label?: string;
    readonly type?: 'smoothstep' | 'straight' | 'step' | 'default';
    readonly animated?: boolean;
}
export interface GeneratedDiagramTemplate {
    readonly templateId: string;
    readonly templateName: string;
    readonly description: string;
    readonly matchedKeywords: readonly string[];
    readonly score: number;
    readonly nodes: readonly GeneratedDiagramNode[];
    readonly edges: readonly GeneratedDiagramEdge[];
}
