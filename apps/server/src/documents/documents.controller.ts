import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../auth/interfaces/auth-service.interface';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ListDocumentsQueryDto } from './dto/list-documents-query.dto';
import { PatchDocumentDto } from './dto/patch-document.dto';
import type { RecordDocumentViewResponseDto } from './dto/record-document-view-response.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import type { DocumentRecord } from './interfaces/document-record.interface';
import type { PaginatedDocumentList } from './interfaces/paginated-document-list.interface';
import {
  DOCUMENTS_SERVICE,
  type IDocumentsService,
} from './interfaces/documents-service.interface';

const DEFAULT_PAGE: number = 1;
const DEFAULT_PAGE_SIZE: number = 20;

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  public constructor(
    @Inject(DOCUMENTS_SERVICE)
    private readonly documentsService: IDocumentsService,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  /** Social / keşif katmanı: kimlik doğrulaması gerekmez. */
  @Get('public')
  @Public()
  public async getPublicDocuments(): Promise<DocumentRecord[]> {
    return this.documentsService.listPublicDocuments();
  }

  @Post(':id/view')
  @Public()
  @HttpCode(HttpStatus.OK)
  public async recordDocumentView(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-anonymous-id') anonymousIdHeader: string | undefined,
  ): Promise<RecordDocumentViewResponseDto> {
    const bearer: string | undefined =
      DocumentsController.extractBearerToken(authorization);
    const subject: string | null =
      await this.authService.tryGetSubjectFromAccessToken(bearer);

    let viewerKey: string;
    let anonymousId: string | undefined;

    if (subject !== null) {
      viewerKey = `user:${subject}`;
    } else {
      const trimmedHeader: string | undefined =
        anonymousIdHeader !== undefined && anonymousIdHeader.trim().length > 0
          ? anonymousIdHeader.trim()
          : undefined;
      if (trimmedHeader === undefined) {
        const generated: string = randomUUID();
        anonymousId = generated;
        viewerKey = `anon:${generated}`;
      } else {
        viewerKey = `anon:${trimmedHeader}`;
      }
    }

    const counted: boolean =
      await this.documentsService.recordPublicDocumentView(id, viewerKey);

    return {
      counted,
      anonymousId,
    };
  }

  @Post(':id/favorite')
  @HttpCode(HttpStatus.CREATED)
  public async favoriteDocument(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<void> {
    const user: PublicUser = DocumentsController.requireUser(req);
    await this.documentsService.addFavorite(user.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Req() req: Request,
    @Body() dto: CreateDocumentDto,
  ): Promise<DocumentRecord> {
    const owner: PublicUser = DocumentsController.requireUser(req);

    return this.documentsService.createDocument(owner.id, {
      title: dto.title,
      visibility: dto.visibility,
      tags: dto.tags,
      categoryName: dto.categoryName,
    });
  }

  @Get()
  public async findAll(
    @Req() req: Request,
    @Query() query: ListDocumentsQueryDto,
  ): Promise<PaginatedDocumentList> {
    const owner: PublicUser = DocumentsController.requireUser(req);
    const page: number = query.page ?? DEFAULT_PAGE;
    const pageSize: number = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const trimmedQuery: string | undefined = query.q?.trim();
    const titleQuery: string | null =
      trimmedQuery !== undefined && trimmedQuery.length > 0
        ? trimmedQuery
        : null;

    return this.documentsService.listDocuments(owner.id, {
      page,
      pageSize,
      titleQuery,
    });
  }

  @Get(':id/related')
  @Public()
  public async getRelatedDocuments(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
  ): Promise<DocumentRecord[]> {
    const bearer: string | undefined =
      DocumentsController.extractBearerToken(authorization);
    const subject: string | null =
      await this.authService.tryGetSubjectFromAccessToken(bearer);

    return this.documentsService.getRelatedDocuments(id, subject);
  }

  @Get(':id')
  public async findOne(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DocumentRecord> {
    const user: PublicUser = DocumentsController.requireUser(req);

    return this.documentsService.getDocument(user.id, id);
  }

  @Put(':id')
  public async updateContent(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ): Promise<DocumentRecord> {
    const owner: PublicUser = DocumentsController.requireUser(req);

    return this.documentsService.updateDocumentContent(
      owner.id,
      id,
      dto.content,
    );
  }

  /** Başlık, görünürlük ve/veya kategori; yalnızca owner. */
  @Patch(':id')
  public async patchDocument(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: PatchDocumentDto,
  ): Promise<DocumentRecord> {
    const owner: PublicUser = DocumentsController.requireUser(req);

    return this.documentsService.patchDocument(owner.id, id, {
      title: dto.title,
      visibility: dto.visibility,
      categoryName: dto.categoryName,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async remove(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<void> {
    const owner: PublicUser = DocumentsController.requireUser(req);

    await this.documentsService.removeDocument(owner.id, id);
  }

  private static requireUser(req: Request): PublicUser {
    if (req.user === undefined) {
      throw new UnauthorizedException();
    }

    return req.user;
  }

  private static extractBearerToken(
    authorization: string | undefined,
  ): string | undefined {
    if (authorization === undefined) {
      return undefined;
    }
    const trimmed: string = authorization.trim();
    if (!trimmed.startsWith('Bearer ')) {
      return undefined;
    }
    const token: string = trimmed.slice(7).trim();
    return token.length > 0 ? token : undefined;
  }
}
