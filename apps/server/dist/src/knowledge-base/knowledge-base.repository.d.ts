import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { KnowledgeDiagramRecord, KnowledgeDiagramSummary } from './interfaces/knowledge-diagram-record.interface';
import type { KnowledgeDocumentRecord, KnowledgeDocumentSummary } from './interfaces/knowledge-document-record.interface';
import type { KnowledgeFlowRecord, KnowledgeFlowSummary } from './interfaces/knowledge-flow-record.interface';
import type { IKnowledgeRepository } from './interfaces/knowledge-repository.interface';
export declare class KnowledgeBaseRepository implements IKnowledgeRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    selectDocumentsOrdered(): Promise<KnowledgeDocumentSummary[]>;
    selectDocumentBySlug(slug: string): Promise<KnowledgeDocumentRecord | null>;
    selectDiagramsOrdered(): Promise<KnowledgeDiagramSummary[]>;
    selectDiagramBySlug(slug: string): Promise<KnowledgeDiagramRecord | null>;
    selectFlowsOrdered(): Promise<KnowledgeFlowSummary[]>;
    selectFlowBySlug(slug: string): Promise<KnowledgeFlowRecord | null>;
}
