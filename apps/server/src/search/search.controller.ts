import { Controller, Get, Headers, Inject, Query, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { PublicSearchHit } from '../documents/interfaces/public-search-hit.interface';
import {
  DOCUMENTS_SERVICE,
  type IDocumentsService,
} from '../documents/interfaces/documents-service.interface';
import {
  DIAGRAMS_SERVICE,
  type IDiagramsService,
} from '../diagrams/interfaces/diagrams-service.interface';
import {
  KNOWLEDGE_SERVICE,
  type IKnowledgeService,
} from '../knowledge-base/interfaces/knowledge-service.interface';
import { parseKnowledgeAcceptLanguage } from '../knowledge-base/knowledge-narrative-locale.util';
import { SearchQueryDto } from './dto/search-query.dto';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  public constructor(
    @Inject(DOCUMENTS_SERVICE)
    private readonly documentsService: IDocumentsService,
    @Inject(DIAGRAMS_SERVICE)
    private readonly diagramsService: IDiagramsService,
    @Inject(KNOWLEDGE_SERVICE)
    private readonly knowledgeService: IKnowledgeService,
  ) {}

  /**
   * Herkese açık doküman, diyagram ve bilgi tabanı içeriklerinde metin araması.
   */
  @Get()
  @Public()
  public async search(
    @Query() query: SearchQueryDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ): Promise<PublicSearchHit[]> {
    const q: string = query.q ?? '';
    const locale = parseKnowledgeAcceptLanguage(acceptLanguage);
    const [documents, diagrams, knowledgeHits] = await Promise.all([
      this.documentsService.searchPublicDocuments(q),
      this.diagramsService.searchPublicDiagrams(q),
      this.knowledgeService.searchGlobally(q, locale),
    ]);
    const merged: PublicSearchHit[] = [
      ...documents,
      ...diagrams,
      ...knowledgeHits,
    ];
    merged.sort(
      (a: PublicSearchHit, b: PublicSearchHit): number =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return merged;
  }
}
