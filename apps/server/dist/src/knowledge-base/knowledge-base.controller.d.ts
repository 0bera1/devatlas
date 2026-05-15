import type { KnowledgeDiagramRecord } from './interfaces/knowledge-diagram-record.interface';
import type { KnowledgeDiagramSummary } from './interfaces/knowledge-diagram-record.interface';
import type { KnowledgeDocumentRecord } from './interfaces/knowledge-document-record.interface';
import type { KnowledgeDocumentSummary } from './interfaces/knowledge-document-record.interface';
import type { KnowledgeFlowRecord } from './interfaces/knowledge-flow-record.interface';
import type { KnowledgeFlowSummary } from './interfaces/knowledge-flow-record.interface';
import { type IKnowledgeService } from './interfaces/knowledge-service.interface';
export declare class KnowledgeBaseController {
    private readonly knowledgeService;
    constructor(knowledgeService: IKnowledgeService);
    listDocuments(): Promise<KnowledgeDocumentSummary[]>;
    getDocument(slug: string): Promise<KnowledgeDocumentRecord>;
    listDiagrams(): Promise<KnowledgeDiagramSummary[]>;
    getDiagram(slug: string): Promise<KnowledgeDiagramRecord>;
    listFlows(): Promise<KnowledgeFlowSummary[]>;
    getFlow(slug: string): Promise<KnowledgeFlowRecord>;
}
