import type { Request } from 'express';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ListDocumentsQueryDto } from './dto/list-documents-query.dto';
import { PatchDocumentDto } from './dto/patch-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import type { DocumentRecord } from './interfaces/document-record.interface';
import type { PaginatedDocumentList } from './interfaces/paginated-document-list.interface';
import { type IDocumentsService } from './interfaces/documents-service.interface';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: IDocumentsService);
    getPublicDocuments(): Promise<DocumentRecord[]>;
    create(req: Request, dto: CreateDocumentDto): Promise<DocumentRecord>;
    findAll(req: Request, query: ListDocumentsQueryDto): Promise<PaginatedDocumentList>;
    findOne(req: Request, id: string): Promise<DocumentRecord>;
    updateContent(req: Request, id: string, dto: UpdateDocumentDto): Promise<DocumentRecord>;
    patchDocument(req: Request, id: string, dto: PatchDocumentDto): Promise<DocumentRecord>;
    remove(req: Request, id: string): Promise<void>;
    private static requireUser;
}
