import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { DocumentRecord } from '../documents/interfaces/document-record.interface';
import {
  DOCUMENTS_SERVICE,
  type IDocumentsService,
} from '../documents/interfaces/documents-service.interface';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  public constructor(
    @Inject(DOCUMENTS_SERVICE)
    private readonly documentsService: IDocumentsService,
  ) {}

  @Get('latest')
  @Public()
  public async latest(): Promise<DocumentRecord[]> {
    return this.documentsService.getLatestPublicFeed();
  }

  @Get('trending')
  @Public()
  public async trending(): Promise<DocumentRecord[]> {
    return this.documentsService.getTrendingPublicFeed();
  }
}
