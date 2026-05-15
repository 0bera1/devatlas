import type { KnowledgeDiagramRecord, KnowledgeDiagramSummary } from './knowledge-diagram-record.interface';
import type { KnowledgeDocumentRecord, KnowledgeDocumentSummary } from './knowledge-document-record.interface';
import type { KnowledgeFlowRecord, KnowledgeFlowSummary } from './knowledge-flow-record.interface';
import type { KnowledgeContentLocale } from '../knowledge-narrative-locale.util';
export declare const KNOWLEDGE_SERVICE: unique symbol;
export interface IKnowledgeService {
    listDocuments(): Promise<KnowledgeDocumentSummary[]>;
    getDocumentBySlug(slug: string): Promise<KnowledgeDocumentRecord>;
    listDiagrams(locale: KnowledgeContentLocale): Promise<KnowledgeDiagramSummary[]>;
    getDiagramBySlug(slug: string, locale: KnowledgeContentLocale): Promise<KnowledgeDiagramRecord>;
    listFlows(locale: KnowledgeContentLocale): Promise<KnowledgeFlowSummary[]>;
    getFlowBySlug(slug: string, locale: KnowledgeContentLocale): Promise<KnowledgeFlowRecord>;
}
