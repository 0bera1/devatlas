import type { KnowledgeDiagramRecord } from './knowledge-diagram-record.interface';
import type { KnowledgeDocumentRecord } from './knowledge-document-record.interface';
import type { KnowledgeFlowRecord } from './knowledge-flow-record.interface';
import type { KnowledgeDiagramSummary } from './knowledge-diagram-record.interface';
import type { KnowledgeDocumentSummary } from './knowledge-document-record.interface';
import type { KnowledgeFlowSummary } from './knowledge-flow-record.interface';
export declare const KNOWLEDGE_REPOSITORY: unique symbol;
export interface IKnowledgeRepository {
    selectDocumentsOrdered(): Promise<KnowledgeDocumentSummary[]>;
    selectDocumentBySlug(slug: string): Promise<KnowledgeDocumentRecord | null>;
    selectDiagramsOrdered(): Promise<KnowledgeDiagramSummary[]>;
    selectDiagramBySlug(slug: string): Promise<KnowledgeDiagramRecord | null>;
    selectFlowsOrdered(): Promise<KnowledgeFlowSummary[]>;
    selectFlowBySlug(slug: string): Promise<KnowledgeFlowRecord | null>;
}
