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
import type { PublicSearchHit } from '../../documents/interfaces/public-search-hit.interface';
import type { KnowledgeContentLocale } from '../knowledge-narrative-locale.util';
import type {
  InterviewPrepCategorySummary,
  InterviewPrepQuestionDetail,
  InterviewPrepQuestionSummary,
} from './interview-prep-record.interface';
import type { PaginatedKnowledgeList } from './paginated-knowledge-list.interface';
import type { KnowledgeListParams } from '../knowledge-pagination.util';

export const KNOWLEDGE_SERVICE: unique symbol = Symbol('KNOWLEDGE_SERVICE');

export interface IKnowledgeService {
  listDocuments(
    params: KnowledgeListParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeDocumentSummary>>;
  getDocumentBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDocumentRecord>;
  listDiagrams(
    locale: KnowledgeContentLocale,
    params: KnowledgeListParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeDiagramSummary>>;
  getDiagramBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDiagramRecord>;
  listFlows(
    locale: KnowledgeContentLocale,
    params: KnowledgeListParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeFlowSummary>>;
  getFlowBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeFlowRecord>;
  listInterviewPrepCategories(): Promise<InterviewPrepCategorySummary[]>;
  listInterviewPrepQuestions(
    category: InterviewQuestionCategory | null,
    difficulty: string | null,
    params: KnowledgeListParams,
    locale: KnowledgeContentLocale,
  ): Promise<PaginatedKnowledgeList<InterviewPrepQuestionSummary>>;
  getInterviewPrepQuestionBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<InterviewPrepQuestionDetail>;
  searchGlobally(
    rawQuery: string,
    locale: KnowledgeContentLocale,
  ): Promise<PublicSearchHit[]>;
}
