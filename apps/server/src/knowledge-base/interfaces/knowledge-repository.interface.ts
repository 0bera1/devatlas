import type { InterviewQuestionCategory } from '@prisma/client';
import type { InterviewKnowledgeResourceType } from '@prisma/client';
import type { KnowledgeContentLocale } from '../knowledge-narrative-locale.util';
import type {
  InterviewKnowledgeResources,
  InterviewQuestionRef,
  KnowledgeResourceRef,
} from './knowledge-resource-ref.interface';
import type { KnowledgeDiagramRecord } from './knowledge-diagram-record.interface';
import type {
  InterviewPrepCategorySummary,
  InterviewPrepQuestionDetail,
  InterviewPrepQuestionSummary,
} from './interview-prep-record.interface';
import type { KnowledgeDocumentRecord } from './knowledge-document-record.interface';
import type { KnowledgeFlowRecord } from './knowledge-flow-record.interface';
import type { KnowledgeDiagramSummary } from './knowledge-diagram-record.interface';
import type { KnowledgeDocumentSummary } from './knowledge-document-record.interface';
import type { KnowledgeFlowSummary } from './knowledge-flow-record.interface';
import type {
  KnowledgeGlobalInterviewSearchRow,
  KnowledgeGlobalSearchRow,
} from './knowledge-global-search-row.interface';

export const KNOWLEDGE_REPOSITORY: unique symbol = Symbol('KNOWLEDGE_REPOSITORY');

export interface IKnowledgeRepository {
  countDocuments(search: string | null): Promise<number>;
  selectDocumentsPage(
    search: string | null,
    skip: number,
    take: number,
  ): Promise<KnowledgeDocumentSummary[]>;
  selectDocumentBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDocumentRecord | null>;
  countDiagrams(search: string | null): Promise<number>;
  selectDiagramsPage(
    locale: KnowledgeContentLocale,
    search: string | null,
    skip: number,
    take: number,
  ): Promise<KnowledgeDiagramSummary[]>;
  selectDiagramBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDiagramRecord | null>;
  countFlows(search: string | null): Promise<number>;
  selectFlowsPage(
    locale: KnowledgeContentLocale,
    search: string | null,
    skip: number,
    take: number,
  ): Promise<KnowledgeFlowSummary[]>;
  selectFlowBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeFlowRecord | null>;
  selectInterviewPrepCategoryCounts(): Promise<InterviewPrepCategorySummary[]>;
  countInterviewPrepQuestionsByCategory(
    category: InterviewQuestionCategory | null,
    difficulty: string | null,
    search: string | null,
  ): Promise<number>;
  selectInterviewPrepQuestionsByCategoryPage(
    category: InterviewQuestionCategory | null,
    difficulty: string | null,
    search: string | null,
    skip: number,
    take: number,
    locale: KnowledgeContentLocale,
  ): Promise<InterviewPrepQuestionSummary[]>;
  selectInterviewPrepQuestionBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<InterviewPrepQuestionDetail | null>;
  selectDocumentsGlobalSearch(
    search: string,
    take: number,
  ): Promise<readonly KnowledgeGlobalSearchRow[]>;
  selectDiagramsGlobalSearch(
    search: string,
    take: number,
  ): Promise<readonly KnowledgeGlobalSearchRow[]>;
  selectFlowsGlobalSearch(
    search: string,
    take: number,
  ): Promise<readonly KnowledgeGlobalSearchRow[]>;
  selectInterviewQuestionsGlobalSearch(
    search: string,
    take: number,
    locale: KnowledgeContentLocale,
  ): Promise<readonly KnowledgeGlobalInterviewSearchRow[]>;
  selectInterviewKnowledgeResourcesByQuestionId(
    questionId: string,
  ): Promise<InterviewKnowledgeResources>;
  selectInterviewQuestionsByResource(
    resourceType: InterviewKnowledgeResourceType,
    resourceSlug: string,
    locale: KnowledgeContentLocale,
  ): Promise<readonly InterviewQuestionRef[]>;
  selectDocumentRefsBySlugs(
    slugs: readonly string[],
  ): Promise<readonly KnowledgeResourceRef[]>;
  selectDiagramRefsBySlugs(
    slugs: readonly string[],
  ): Promise<readonly KnowledgeResourceRef[]>;
  selectFlowRefsBySlugs(
    slugs: readonly string[],
  ): Promise<readonly KnowledgeResourceRef[]>;
}
