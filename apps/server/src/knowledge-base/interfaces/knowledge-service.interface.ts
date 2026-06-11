import type {
  KnowledgeDiagramRecord,
  KnowledgeDiagramSummary,
} from './knowledge-diagram-record.interface';
import type {
  KnowledgeDocumentRecord,
  KnowledgeDocumentSummary,
} from './knowledge-document-record.interface';
import type {
  KnowledgeFlowRecord,
  KnowledgeFlowSummary,
} from './knowledge-flow-record.interface';
import type { InterviewQuestionCategory } from '@prisma/client';
import type { KnowledgeContentLocale } from '../knowledge-narrative-locale.util';
import type {
  InterviewPrepCategorySummary,
  InterviewPrepQuestionDetail,
  InterviewPrepQuestionSummary,
} from './interview-prep-record.interface';
import type { PaginatedKnowledgeList } from './paginated-knowledge-list.interface';
import type { KnowledgePaginationParams } from '../knowledge-pagination.util';

export const KNOWLEDGE_SERVICE: unique symbol = Symbol('KNOWLEDGE_SERVICE');

export interface IKnowledgeService {
  listDocuments(
    pagination: KnowledgePaginationParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeDocumentSummary>>;
  getDocumentBySlug(slug: string): Promise<KnowledgeDocumentRecord>;
  listDiagrams(
    locale: KnowledgeContentLocale,
    pagination: KnowledgePaginationParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeDiagramSummary>>;
  getDiagramBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDiagramRecord>;
  listFlows(
    locale: KnowledgeContentLocale,
    pagination: KnowledgePaginationParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeFlowSummary>>;
  getFlowBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeFlowRecord>;
  listInterviewPrepCategories(): Promise<InterviewPrepCategorySummary[]>;
  listInterviewPrepQuestions(
    category: InterviewQuestionCategory | null,
    pagination: KnowledgePaginationParams,
  ): Promise<PaginatedKnowledgeList<InterviewPrepQuestionSummary>>;
  getInterviewPrepQuestionBySlug(
    slug: string,
  ): Promise<InterviewPrepQuestionDetail>;
}
