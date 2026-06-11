import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { InterviewQuestionCategory } from '@prisma/client';
import type {
  InterviewPrepCategorySummary,
  InterviewPrepQuestionDetail,
  InterviewPrepQuestionSummary,
} from './interfaces/interview-prep-record.interface';
import type {
  KnowledgeDiagramRecord,
  KnowledgeDiagramSummary,
} from './interfaces/knowledge-diagram-record.interface';
import type {
  KnowledgeDocumentRecord,
  KnowledgeDocumentSummary,
} from './interfaces/knowledge-document-record.interface';
import type {
  KnowledgeFlowRecord,
  KnowledgeFlowSummary,
} from './interfaces/knowledge-flow-record.interface';
import {
  KNOWLEDGE_REPOSITORY,
  type IKnowledgeRepository,
} from './interfaces/knowledge-repository.interface';
import type { PaginatedKnowledgeList } from './interfaces/paginated-knowledge-list.interface';
import type { KnowledgeContentLocale } from './knowledge-narrative-locale.util';
import type { IKnowledgeService } from './interfaces/knowledge-service.interface';
import {
  buildPaginatedKnowledgeList,
  type KnowledgePaginationParams,
} from './knowledge-pagination.util';

@Injectable()
export class KnowledgeBaseService implements IKnowledgeService {
  public constructor(
    @Inject(KNOWLEDGE_REPOSITORY)
    private readonly repository: IKnowledgeRepository,
  ) {}

  public async listDocuments(
    pagination: KnowledgePaginationParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeDocumentSummary>> {
    const skip: number = (pagination.page - 1) * pagination.pageSize;
    const [total, items] = await Promise.all([
      this.repository.countDocuments(),
      this.repository.selectDocumentsPage(skip, pagination.pageSize),
    ]);
    return buildPaginatedKnowledgeList(
      items,
      total,
      pagination.page,
      pagination.pageSize,
    );
  }

  public async getDocumentBySlug(slug: string): Promise<KnowledgeDocumentRecord> {
    const row: KnowledgeDocumentRecord | null =
      await this.repository.selectDocumentBySlug(slug);
    if (row === null) {
      throw new NotFoundException(`Knowledge document "${slug}" not found`);
    }
    return row;
  }

  public async listDiagrams(
    locale: KnowledgeContentLocale,
    pagination: KnowledgePaginationParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeDiagramSummary>> {
    const skip: number = (pagination.page - 1) * pagination.pageSize;
    const [total, items] = await Promise.all([
      this.repository.countDiagrams(),
      this.repository.selectDiagramsPage(locale, skip, pagination.pageSize),
    ]);
    return buildPaginatedKnowledgeList(
      items,
      total,
      pagination.page,
      pagination.pageSize,
    );
  }

  public async getDiagramBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDiagramRecord> {
    const row: KnowledgeDiagramRecord | null =
      await this.repository.selectDiagramBySlug(slug, locale);
    if (row === null) {
      throw new NotFoundException(`Knowledge diagram "${slug}" not found`);
    }
    return row;
  }

  public async listFlows(
    locale: KnowledgeContentLocale,
    pagination: KnowledgePaginationParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeFlowSummary>> {
    const skip: number = (pagination.page - 1) * pagination.pageSize;
    const [total, items] = await Promise.all([
      this.repository.countFlows(),
      this.repository.selectFlowsPage(locale, skip, pagination.pageSize),
    ]);
    return buildPaginatedKnowledgeList(
      items,
      total,
      pagination.page,
      pagination.pageSize,
    );
  }

  public async getFlowBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeFlowRecord> {
    const row: KnowledgeFlowRecord | null =
      await this.repository.selectFlowBySlug(slug, locale);
    if (row === null) {
      throw new NotFoundException(`Knowledge flow "${slug}" not found`);
    }
    return row;
  }

  public async listInterviewPrepCategories(): Promise<
    InterviewPrepCategorySummary[]
  > {
    return this.repository.selectInterviewPrepCategoryCounts();
  }

  public async listInterviewPrepQuestions(
    category: InterviewQuestionCategory | null,
    pagination: KnowledgePaginationParams,
  ): Promise<PaginatedKnowledgeList<InterviewPrepQuestionSummary>> {
    const skip: number = (pagination.page - 1) * pagination.pageSize;
    const [total, items] = await Promise.all([
      this.repository.countInterviewPrepQuestionsByCategory(category),
      this.repository.selectInterviewPrepQuestionsByCategoryPage(
        category,
        skip,
        pagination.pageSize,
      ),
    ]);
    return buildPaginatedKnowledgeList(
      items,
      total,
      pagination.page,
      pagination.pageSize,
    );
  }

  public async getInterviewPrepQuestionBySlug(
    slug: string,
  ): Promise<InterviewPrepQuestionDetail> {
    const row: InterviewPrepQuestionDetail | null =
      await this.repository.selectInterviewPrepQuestionBySlug(slug);
    if (row === null) {
      throw new NotFoundException(
        `Interview question "${slug}" not found`,
      );
    }
    return row;
  }
}
