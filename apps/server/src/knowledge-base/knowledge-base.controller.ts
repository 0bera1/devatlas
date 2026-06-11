import {
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Query,
} from '@nestjs/common';
import type { InterviewQuestionCategory } from '@prisma/client';
import type {
  InterviewPrepCategorySummary,
  InterviewPrepQuestionDetail,
  InterviewPrepQuestionSummary,
} from './interfaces/interview-prep-record.interface';
import { Public } from '../auth/decorators/public.decorator';
import type { KnowledgeDiagramRecord } from './interfaces/knowledge-diagram-record.interface';
import type { KnowledgeDiagramSummary } from './interfaces/knowledge-diagram-record.interface';
import type { KnowledgeDocumentRecord } from './interfaces/knowledge-document-record.interface';
import type { KnowledgeDocumentSummary } from './interfaces/knowledge-document-record.interface';
import type { KnowledgeFlowRecord } from './interfaces/knowledge-flow-record.interface';
import type { KnowledgeFlowSummary } from './interfaces/knowledge-flow-record.interface';
import type { PaginatedKnowledgeList } from './interfaces/paginated-knowledge-list.interface';
import {
  KNOWLEDGE_SERVICE,
  type IKnowledgeService,
} from './interfaces/knowledge-service.interface';
import { parseInterviewQuestionDifficulty } from './interview-difficulty.util';
import { parseKnowledgeAcceptLanguage } from './knowledge-narrative-locale.util';
import { parseKnowledgeListParams } from './knowledge-pagination.util';

@Controller('knowledge')
@Public()
export class KnowledgeBaseController {
  public constructor(
    @Inject(KNOWLEDGE_SERVICE)
    private readonly knowledgeService: IKnowledgeService,
  ) {}

  @Get('documents')
  public async listDocuments(
    @Query('page') page: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('q') q: string | undefined,
  ): Promise<PaginatedKnowledgeList<KnowledgeDocumentSummary>> {
    return this.knowledgeService.listDocuments(
      parseKnowledgeListParams(page, pageSize, q),
    );
  }

  @Get('documents/:slug')
  public async getDocument(
    @Param('slug') slug: string,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ): Promise<KnowledgeDocumentRecord> {
    return this.knowledgeService.getDocumentBySlug(
      slug,
      parseKnowledgeAcceptLanguage(acceptLanguage),
    );
  }

  @Get('diagrams')
  public async listDiagrams(
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Query('page') page: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('q') q: string | undefined,
  ): Promise<PaginatedKnowledgeList<KnowledgeDiagramSummary>> {
    return this.knowledgeService.listDiagrams(
      parseKnowledgeAcceptLanguage(acceptLanguage),
      parseKnowledgeListParams(page, pageSize, q),
    );
  }

  @Get('diagrams/:slug')
  public async getDiagram(
    @Param('slug') slug: string,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ): Promise<KnowledgeDiagramRecord> {
    return this.knowledgeService.getDiagramBySlug(
      slug,
      parseKnowledgeAcceptLanguage(acceptLanguage),
    );
  }

  @Get('flows')
  public async listFlows(
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Query('page') page: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('q') q: string | undefined,
  ): Promise<PaginatedKnowledgeList<KnowledgeFlowSummary>> {
    return this.knowledgeService.listFlows(
      parseKnowledgeAcceptLanguage(acceptLanguage),
      parseKnowledgeListParams(page, pageSize, q),
    );
  }

  @Get('flows/:slug')
  public async getFlow(
    @Param('slug') slug: string,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ): Promise<KnowledgeFlowRecord> {
    return this.knowledgeService.getFlowBySlug(
      slug,
      parseKnowledgeAcceptLanguage(acceptLanguage),
    );
  }

  @Get('interview/categories')
  public async listInterviewPrepCategories(): Promise<
    InterviewPrepCategorySummary[]
  > {
    return this.knowledgeService.listInterviewPrepCategories();
  }

  @Get('interview/questions')
  public async listInterviewPrepQuestions(
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Query('category') category: InterviewQuestionCategory | undefined,
    @Query('difficulty') difficultyRaw: string | undefined,
    @Query('page') page: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('q') q: string | undefined,
  ): Promise<PaginatedKnowledgeList<InterviewPrepQuestionSummary>> {
    return this.knowledgeService.listInterviewPrepQuestions(
      category ?? null,
      parseInterviewQuestionDifficulty(difficultyRaw),
      parseKnowledgeListParams(page, pageSize, q),
      parseKnowledgeAcceptLanguage(acceptLanguage),
    );
  }

  @Get('interview/questions/:slug')
  public async getInterviewPrepQuestion(
    @Param('slug') slug: string,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ): Promise<InterviewPrepQuestionDetail> {
    return this.knowledgeService.getInterviewPrepQuestionBySlug(
      slug,
      parseKnowledgeAcceptLanguage(acceptLanguage),
    );
  }
}
