import type { DocumentRecord } from '../../documents/interfaces/document-record.interface';
import type { DiagramSummary } from '../../diagrams/interfaces/diagram-summary.interface';
export interface ScoredDiagramRecommendation extends DiagramSummary {
    readonly score: number;
    readonly matchingKeywords: readonly string[];
}
export interface ScoredDocumentRecommendation extends DocumentRecord {
    readonly score: number;
    readonly matchingKeywords: readonly string[];
}
export interface SimilarTechnologyRecommendation {
    readonly label: string;
    readonly score: number;
    readonly relatedDiagramCount: number;
}
export interface DiagramIntelligenceResource {
    readonly semanticTags: readonly string[];
    readonly relatedDiagrams: readonly ScoredDiagramRecommendation[];
    readonly relatedDocuments: readonly ScoredDocumentRecommendation[];
    readonly relatedInterviewQuestions: readonly ScoredDocumentRecommendation[];
    readonly similarTechnologies: readonly SimilarTechnologyRecommendation[];
}
