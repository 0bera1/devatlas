export declare const diagramNarratives: Readonly<Record<string, string>>;
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
export declare const flowNarratives: readonly SeedFlowNarrativeInput[];
