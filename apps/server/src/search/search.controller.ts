import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
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
import { SearchQueryDto } from './dto/search-query.dto';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  public constructor(
    @Inject(DOCUMENTS_SERVICE)
    private readonly documentsService: IDocumentsService,
    @Inject(DIAGRAMS_SERVICE)
    private readonly diagramsService: IDiagramsService,
  ) {}

  /**
   * Herkese açık doküman ve diyagramlarda metin araması (birleşik sonuç listesi).
   */
  @Get()
  @Public()
  public async search(
    @Query() query: SearchQueryDto,
  ): Promise<PublicSearchHit[]> {
    const q: string = query.q ?? '';
    const [documents, diagrams] = await Promise.all([
      this.documentsService.searchPublicDocuments(q),
      this.diagramsService.searchPublicDiagrams(q),
    ]);
    const merged: PublicSearchHit[] = [...documents, ...diagrams];
    merged.sort(
      (a: PublicSearchHit, b: PublicSearchHit): number =>
        b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
    return merged;
  }
}
