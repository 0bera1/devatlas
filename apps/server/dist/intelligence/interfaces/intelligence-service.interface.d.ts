import type { DiagramIntelligenceResource } from './diagram-intelligence-resource.interface';
import type { GeneratedDiagramTemplate } from './generated-diagram-template.interface';
import type { RelatedInterviewQuestionsResource } from './related-interview-question.interface';
export declare const INTELLIGENCE_SERVICE: unique symbol;
export interface AutoTagSource {
    readonly title?: string;
    readonly content?: string;
    readonly extraKeywords?: readonly string[];
}
export interface IIntelligenceService {
    extractDiagramKeywords(diagramId: string): Promise<string[]>;
    getDiagramResources(diagramId: string, viewerUserId: string | null): Promise<DiagramIntelligenceResource>;
    extractAutoTagsFromSource(source: AutoTagSource): string[];
    generateDiagramFromPrompt(prompt: string): GeneratedDiagramTemplate;
    getRelatedInterviewQuestionsForDocument(documentId: string, viewerUserId: string | null): Promise<RelatedInterviewQuestionsResource>;
}
