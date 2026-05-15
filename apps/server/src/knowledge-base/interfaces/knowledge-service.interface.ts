import type { KnowledgeDiagramRecord } from './knowledge-diagram-record.interface';
import type { KnowledgeDocumentRecord } from './knowledge-document-record.interface';
import type { KnowledgeFlowRecord } from './knowledge-flow-record.interface';
import type { KnowledgeDiagramSummary } from './knowledge-diagram-record.interface';
import type { KnowledgeDocumentSummary } from './knowledge-document-record.interface';
import type { KnowledgeFlowSummary } from './knowledge-flow-record.interface';

export const KNOWLEDGE_SERVICE: unique symbol = Symbol('KNOWLEDGE_SERVICE');

export interface IKnowledgeService {
  listDocuments(): Promise<KnowledgeDocumentSummary[]>;
  getDocumentBySlug(slug: string): Promise<KnowledgeDocumentRecord>;
  listDiagrams(): Promise<KnowledgeDiagramSummary[]>;
  getDiagramBySlug(slug: string): Promise<KnowledgeDiagramRecord>;
  listFlows(): Promise<KnowledgeFlowSummary[]>;
  getFlowBySlug(slug: string): Promise<KnowledgeFlowRecord>;
}
