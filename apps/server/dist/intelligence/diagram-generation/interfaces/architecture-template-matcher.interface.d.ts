import type { ArchitectureTemplate } from './architecture-template.interface';
export declare const ARCHITECTURE_TEMPLATE_MATCHER: unique symbol;
export interface ArchitectureTemplateMatchResult {
    readonly template: ArchitectureTemplate;
    readonly matchedKeywords: readonly string[];
    readonly score: number;
}
export interface IArchitectureTemplateMatcher {
    match(prompt: string): ArchitectureTemplateMatchResult;
}
