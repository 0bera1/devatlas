import {
  Body,
  Controller,
  Delete,
  Get,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ListDocumentsQueryDto } from './dto/list-documents-query.dto';
import { PatchDocumentDto } from './dto/patch-document.dto';
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
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Req() req: Request,
    @Body() dto: CreateDocumentDto,
  ): Promise<DocumentRecord> {
    const owner: PublicUser = DocumentsController.requireUser(req);

    return this.documentsService.createDocument(owner.id, dto.title);
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

  @Get(':id')
  public async findOne(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DocumentRecord> {
    const owner: PublicUser = DocumentsController.requireUser(req);

    return this.documentsService.getDocument(owner.id, id);
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

  @Patch(':id')
  public async patchTitle(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: PatchDocumentDto,
  ): Promise<DocumentRecord> {
    const owner: PublicUser = DocumentsController.requireUser(req);

    return this.documentsService.updateDocumentTitle(owner.id, id, dto.title);
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
}
