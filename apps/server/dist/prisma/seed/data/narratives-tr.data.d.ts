export declare const diagramNarrativesTr: Readonly<Record<string, string>>;
export interface SeedFlowStepNarrativeInput {
    readonly diagramSlug: string;
    readonly label: string;
    readonly narrative: string;
}
export interface SeedFlowNarrativeInput {
    readonly slug: string;
    readonly narrative: string;
    readonly steps: readonly SeedFlowStepNarrativeInput[];
}
export declare const flowNarrativesTr: readonly SeedFlowNarrativeInput[];
