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
import {
  KNOWLEDGE_SERVICE,
  type IKnowledgeService,
} from './interfaces/knowledge-service.interface';
import { parseKnowledgeAcceptLanguage } from './knowledge-narrative-locale.util';

@Controller('knowledge')
@Public()
export class KnowledgeBaseController {
  public constructor(
    @Inject(KNOWLEDGE_SERVICE)
    private readonly knowledgeService: IKnowledgeService,
  ) {}

  @Get('documents')
  public async listDocuments(): Promise<KnowledgeDocumentSummary[]> {
    return this.knowledgeService.listDocuments();
  }

  @Get('documents/:slug')
  public async getDocument(
    @Param('slug') slug: string,
  ): Promise<KnowledgeDocumentRecord> {
    return this.knowledgeService.getDocumentBySlug(slug);
  }

  @Get('diagrams')
  public async listDiagrams(
    @Headers('accept-language') acceptLanguage: string | undefined,
  ): Promise<KnowledgeDiagramSummary[]> {
    return this.knowledgeService.listDiagrams(
      parseKnowledgeAcceptLanguage(acceptLanguage),
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
  ): Promise<KnowledgeFlowSummary[]> {
    return this.knowledgeService.listFlows(
      parseKnowledgeAcceptLanguage(acceptLanguage),
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
    @Query('category') category: InterviewQuestionCategory | undefined,
  ): Promise<InterviewPrepQuestionSummary[]> {
    return this.knowledgeService.listInterviewPrepQuestions(category ?? null);
  }

  @Get('interview/questions/:slug')
  public async getInterviewPrepQuestion(
    @Param('slug') slug: string,
  ): Promise<InterviewPrepQuestionDetail> {
    return this.knowledgeService.getInterviewPrepQuestionBySlug(slug);
  }
}
