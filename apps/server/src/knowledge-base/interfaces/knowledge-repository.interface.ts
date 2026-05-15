import type { KnowledgeContentLocale } from '../knowledge-narrative-locale.util';
import type { KnowledgeDiagramRecord } from './knowledge-diagram-record.interface';
import type { KnowledgeDocumentRecord } from './knowledge-document-record.interface';
import type { KnowledgeFlowRecord } from './knowledge-flow-record.interface';
import type { KnowledgeDiagramSummary } from './knowledge-diagram-record.interface';
import type { KnowledgeDocumentSummary } from './knowledge-document-record.interface';
import type { KnowledgeFlowSummary } from './knowledge-flow-record.interface';

export const KNOWLEDGE_REPOSITORY: unique symbol = Symbol('KNOWLEDGE_REPOSITORY');

export interface IKnowledgeRepository {
  selectDocumentsOrdered(): Promise<KnowledgeDocumentSummary[]>;
  selectDocumentBySlug(slug: string): Promise<KnowledgeDocumentRecord | null>;
  selectDiagramsOrdered(
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDiagramSummary[]>;
  selectDiagramBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDiagramRecord | null>;
  selectFlowsOrdered(
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeFlowSummary[]>;
  selectFlowBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeFlowRecord | null>;
}
