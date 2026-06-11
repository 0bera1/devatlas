import type { InterviewQuestionCategory } from '@prisma/client';
import type { KnowledgeContentLocale } from '../knowledge-narrative-locale.util';
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

export const KNOWLEDGE_REPOSITORY: unique symbol = Symbol('KNOWLEDGE_REPOSITORY');

export interface IKnowledgeRepository {
  countDocuments(): Promise<number>;
  selectDocumentsPage(
    skip: number,
    take: number,
  ): Promise<KnowledgeDocumentSummary[]>;
  selectDocumentBySlug(slug: string): Promise<KnowledgeDocumentRecord | null>;
  countDiagrams(): Promise<number>;
  selectDiagramsPage(
    locale: KnowledgeContentLocale,
    skip: number,
    take: number,
  ): Promise<KnowledgeDiagramSummary[]>;
  selectDiagramBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDiagramRecord | null>;
  countFlows(): Promise<number>;
  selectFlowsPage(
    locale: KnowledgeContentLocale,
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
  ): Promise<number>;
  selectInterviewPrepQuestionsByCategoryPage(
    category: InterviewQuestionCategory | null,
    skip: number,
    take: number,
  ): Promise<InterviewPrepQuestionSummary[]>;
  selectInterviewPrepQuestionBySlug(
    slug: string,
  ): Promise<InterviewPrepQuestionDetail | null>;
}
