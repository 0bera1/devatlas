import type { KnowledgeDiagramRecord, KnowledgeDiagramSummary } from './interfaces/knowledge-diagram-record.interface';
import type { KnowledgeDocumentRecord, KnowledgeDocumentSummary } from './interfaces/knowledge-document-record.interface';
import type { KnowledgeFlowRecord, KnowledgeFlowSummary } from './interfaces/knowledge-flow-record.interface';
import { type IKnowledgeRepository } from './interfaces/knowledge-repository.interface';
import type { KnowledgeContentLocale } from './knowledge-narrative-locale.util';
import type { IKnowledgeService } from './interfaces/knowledge-service.interface';
export declare class KnowledgeBaseService implements IKnowledgeService {
    private readonly repository;
    constructor(repository: IKnowledgeRepository);
    listDocuments(): Promise<KnowledgeDocumentSummary[]>;
    getDocumentBySlug(slug: string): Promise<KnowledgeDocumentRecord>;
    listDiagrams(locale: KnowledgeContentLocale): Promise<KnowledgeDiagramSummary[]>;
    getDiagramBySlug(slug: string, locale: KnowledgeContentLocale): Promise<KnowledgeDiagramRecord>;
    listFlows(locale: KnowledgeContentLocale): Promise<KnowledgeFlowSummary[]>;
    getFlowBySlug(slug: string, locale: KnowledgeContentLocale): Promise<KnowledgeFlowRecord>;
}
