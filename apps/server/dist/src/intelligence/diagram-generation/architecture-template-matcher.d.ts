import type { ArchitectureTemplateMatchResult, IArchitectureTemplateMatcher } from './interfaces/architecture-template-matcher.interface';
export declare class ArchitectureTemplateMatcher implements IArchitectureTemplateMatcher {
    match(prompt: string): ArchitectureTemplateMatchResult;
    private normalizePrompt;
    private collectMatchedKeywords;
    private toFallbackResult;
}
