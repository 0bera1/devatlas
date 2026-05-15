import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { AccessibleDocumentTagsRow, DiagramKeywordNodeRow, DiagramRecommendationRow, DocumentRecommendationRow, IIntelligenceRepository } from './interfaces/intelligence-repository.interface';
export declare class IntelligenceRepository implements IIntelligenceRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    selectAccessibleDiagramId(diagramId: string, viewerUserId: string | null): Promise<string | null>;
    selectNodeLabelsByDiagramId(diagramId: string): Promise<DiagramKeywordNodeRow[]>;
    selectPublicDiagramCandidatesByKeywords(sourceDiagramId: string, keywords: readonly string[], take: number): Promise<DiagramRecommendationRow[]>;
    selectPublicDocumentCandidatesByKeywords(keywords: readonly string[], take: number, interviewOnly: boolean): Promise<DocumentRecommendationRow[]>;
    selectPublicTechnologyDiagramCandidatesByKeywords(sourceDiagramId: string, keywords: readonly string[], take: number): Promise<DiagramRecommendationRow[]>;
    selectAccessibleDocumentTags(documentId: string, viewerUserId: string | null): Promise<AccessibleDocumentTagsRow | null>;
    private buildDiagramKeywordFilters;
    private buildDocumentKeywordFilters;
    private buildDocumentInterviewMarkerFilters;
}
