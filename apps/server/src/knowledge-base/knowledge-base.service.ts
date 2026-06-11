import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { InterviewQuestionCategory } from '@prisma/client';
import type { PublicSearchHit } from '../documents/interfaces/public-search-hit.interface';
import {
  buildSearchPreview,
  SEARCH_PREVIEW_MAX_CHARS,
} from '../documents/utils/search-preview';
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
import type { KnowledgeGlobalInterviewSearchRow } from './interfaces/knowledge-global-search-row.interface';
import type { KnowledgeGlobalSearchRow } from './interfaces/knowledge-global-search-row.interface';
import {
  KNOWLEDGE_REPOSITORY,
  type IKnowledgeRepository,
} from './interfaces/knowledge-repository.interface';
import type { PaginatedKnowledgeList } from './interfaces/paginated-knowledge-list.interface';
import type { KnowledgeContentLocale } from './knowledge-narrative-locale.util';
import type { IKnowledgeService } from './interfaces/knowledge-service.interface';
import {
  buildPaginatedKnowledgeList,
  type KnowledgeListParams,
} from './knowledge-pagination.util';
import { KNOWLEDGE_GLOBAL_SEARCH_LIMIT } from './knowledge-search.util';

@Injectable()
export class KnowledgeBaseService implements IKnowledgeService {
  public constructor(
    @Inject(KNOWLEDGE_REPOSITORY)
    private readonly repository: IKnowledgeRepository,
  ) {}

  public async listDocuments(
    params: KnowledgeListParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeDocumentSummary>> {
    const skip: number = (params.page - 1) * params.pageSize;
    const [total, items] = await Promise.all([
      this.repository.countDocuments(params.search),
      this.repository.selectDocumentsPage(
        params.search,
        skip,
        params.pageSize,
      ),
    ]);
    return buildPaginatedKnowledgeList(
      items,
      total,
      params.page,
      params.pageSize,
    );
  }

  public async getDocumentBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDocumentRecord> {
    const row: KnowledgeDocumentRecord | null =
      await this.repository.selectDocumentBySlug(slug, locale);
    if (row === null) {
      throw new NotFoundException(`Knowledge document "${slug}" not found`);
    }
    return row;
  }

  public async listDiagrams(
    locale: KnowledgeContentLocale,
    params: KnowledgeListParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeDiagramSummary>> {
    const skip: number = (params.page - 1) * params.pageSize;
    const [total, items] = await Promise.all([
      this.repository.countDiagrams(params.search),
      this.repository.selectDiagramsPage(
        locale,
        params.search,
        skip,
        params.pageSize,
      ),
    ]);
    return buildPaginatedKnowledgeList(
      items,
      total,
      params.page,
      params.pageSize,
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
    params: KnowledgeListParams,
  ): Promise<PaginatedKnowledgeList<KnowledgeFlowSummary>> {
    const skip: number = (params.page - 1) * params.pageSize;
    const [total, items] = await Promise.all([
      this.repository.countFlows(params.search),
      this.repository.selectFlowsPage(
        locale,
        params.search,
        skip,
        params.pageSize,
      ),
    ]);
    return buildPaginatedKnowledgeList(
      items,
      total,
      params.page,
      params.pageSize,
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
    difficulty: string | null,
    params: KnowledgeListParams,
    locale: KnowledgeContentLocale,
  ): Promise<PaginatedKnowledgeList<InterviewPrepQuestionSummary>> {
    const skip: number = (params.page - 1) * params.pageSize;
    const [total, items] = await Promise.all([
      this.repository.countInterviewPrepQuestionsByCategory(
        category,
        difficulty,
        params.search,
      ),
      this.repository.selectInterviewPrepQuestionsByCategoryPage(
        category,
        difficulty,
        params.search,
        skip,
        params.pageSize,
        locale,
      ),
    ]);
    return buildPaginatedKnowledgeList(
      items,
      total,
      params.page,
      params.pageSize,
    );
  }

  public async getInterviewPrepQuestionBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<InterviewPrepQuestionDetail> {
    const row: InterviewPrepQuestionDetail | null =
      await this.repository.selectInterviewPrepQuestionBySlug(slug, locale);
    if (row === null) {
      throw new NotFoundException(
        `Interview question "${slug}" not found`,
      );
    }
    return row;
  }

  public async searchGlobally(
    rawQuery: string,
    locale: KnowledgeContentLocale,
  ): Promise<PublicSearchHit[]> {
    const trimmed: string = rawQuery.trim();
    if (trimmed.length === 0) {
      return [];
    }

    const [documents, diagrams, flows, interviews] = await Promise.all([
      this.repository.selectDocumentsGlobalSearch(
        trimmed,
        KNOWLEDGE_GLOBAL_SEARCH_LIMIT,
      ),
      this.repository.selectDiagramsGlobalSearch(
        trimmed,
        KNOWLEDGE_GLOBAL_SEARCH_LIMIT,
      ),
      this.repository.selectFlowsGlobalSearch(
        trimmed,
        KNOWLEDGE_GLOBAL_SEARCH_LIMIT,
      ),
      this.repository.selectInterviewQuestionsGlobalSearch(
        trimmed,
        KNOWLEDGE_GLOBAL_SEARCH_LIMIT,
        locale,
      ),
    ]);

    const knowledgeDocumentHits: PublicSearchHit[] = documents.map(
      (row: KnowledgeGlobalSearchRow): PublicSearchHit => ({
        kind: 'knowledge_document',
        slug: row.slug,
        title: row.title,
        preview: buildSearchPreview(row.previewSource, SEARCH_PREVIEW_MAX_CHARS),
        updatedAt: row.updatedAt,
      }),
    );

    const knowledgeDiagramHits: PublicSearchHit[] = diagrams.map(
      (row: KnowledgeGlobalSearchRow): PublicSearchHit => ({
        kind: 'knowledge_diagram',
        slug: row.slug,
        title: row.title,
        preview: buildSearchPreview(row.previewSource, SEARCH_PREVIEW_MAX_CHARS),
        updatedAt: row.updatedAt,
      }),
    );

    const knowledgeFlowHits: PublicSearchHit[] = flows.map(
      (row: KnowledgeGlobalSearchRow): PublicSearchHit => ({
        kind: 'knowledge_flow',
        slug: row.slug,
        title: row.title,
        preview: buildSearchPreview(row.previewSource, SEARCH_PREVIEW_MAX_CHARS),
        updatedAt: row.updatedAt,
      }),
    );

    const interviewHits: PublicSearchHit[] = interviews.map(
      (row: KnowledgeGlobalInterviewSearchRow): PublicSearchHit => ({
        kind: 'interview_question',
        slug: row.slug,
        title: row.question,
        preview: buildSearchPreview(row.answer, SEARCH_PREVIEW_MAX_CHARS),
        category: row.category,
        isFollowUp: false,
        updatedAt: row.updatedAt,
      }),
    );

    return [
      ...knowledgeDocumentHits,
      ...knowledgeDiagramHits,
      ...knowledgeFlowHits,
      ...interviewHits,
    ];
  }
}
