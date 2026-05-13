import { type ITechKeywordExtractor } from './auto-tag/interfaces/tech-keyword-extractor.interface';
import { type IArchitectureTemplateMatcher } from './diagram-generation/interfaces/architecture-template-matcher.interface';
import type { DiagramIntelligenceResource } from './interfaces/diagram-intelligence-resource.interface';
import type { GeneratedDiagramTemplate } from './interfaces/generated-diagram-template.interface';
import { type IIntelligenceRepository } from './interfaces/intelligence-repository.interface';
import type { AutoTagSource, IIntelligenceService } from './interfaces/intelligence-service.interface';
import type { RelatedInterviewQuestionsResource } from './interfaces/related-interview-question.interface';
import { type IInterviewQuestionRepository } from './interview-questions/interfaces/interview-question-repository.interface';
export declare class IntelligenceService implements IIntelligenceService {
    private readonly intelligenceRepository;
    private readonly techKeywordExtractor;
    private readonly architectureTemplateMatcher;
    private readonly interviewQuestionRepository;
    constructor(intelligenceRepository: IIntelligenceRepository, techKeywordExtractor: ITechKeywordExtractor, architectureTemplateMatcher: IArchitectureTemplateMatcher, interviewQuestionRepository: IInterviewQuestionRepository);
    getRelatedInterviewQuestionsForDocument(documentId: string, viewerUserId: string | null): Promise<RelatedInterviewQuestionsResource>;
    private collectInterviewQuestionTags;
    private scoreInterviewQuestion;
    generateDiagramFromPrompt(prompt: string): GeneratedDiagramTemplate;
    extractAutoTagsFromSource(source: AutoTagSource): string[];
    extractDiagramKeywords(diagramId: string): Promise<string[]>;
    getDiagramResources(diagramId: string, viewerUserId: string | null): Promise<DiagramIntelligenceResource>;
    private normalizeKeywords;
    private scoreDiagramRows;
    private scoreDocumentRows;
    private scoreSimilarTechnologies;
    private findMatchingKeywords;
    private takeTopByScore;
}
