import type { Request } from 'express';
import { type IAuthService } from '../auth/interfaces/auth-service.interface';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ListDocumentsQueryDto } from './dto/list-documents-query.dto';
import { PatchDocumentDto } from './dto/patch-document.dto';
import type { RecordDocumentViewResponseDto } from './dto/record-document-view-response.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import type { DocumentRecord } from './interfaces/document-record.interface';
import type { PaginatedDocumentList } from './interfaces/paginated-document-list.interface';
import { type IDocumentsService } from './interfaces/documents-service.interface';
export declare class DocumentsController {
    private readonly documentsService;
    private readonly authService;
    constructor(documentsService: IDocumentsService, authService: IAuthService);
    getPublicDocuments(): Promise<DocumentRecord[]>;
    recordDocumentView(id: string, authorization: string | undefined, anonymousIdHeader: string | undefined): Promise<RecordDocumentViewResponseDto>;
    favoriteDocument(req: Request, id: string): Promise<void>;
    create(req: Request, dto: CreateDocumentDto): Promise<DocumentRecord>;
    findAll(req: Request, query: ListDocumentsQueryDto): Promise<PaginatedDocumentList>;
    getRelatedDocuments(id: string, authorization: string | undefined): Promise<DocumentRecord[]>;
    findOne(req: Request, id: string): Promise<DocumentRecord>;
    updateContent(req: Request, id: string, dto: UpdateDocumentDto): Promise<DocumentRecord>;
    patchDocument(req: Request, id: string, dto: PatchDocumentDto): Promise<DocumentRecord>;
    remove(req: Request, id: string): Promise<void>;
    private static requireUser;
    private static extractBearerToken;
}
