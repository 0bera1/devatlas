import type { DocumentRecord } from './interfaces/document-record.interface';
import { type IDocumentRepository } from './interfaces/document-repository.interface';
import type { PaginatedDocumentList } from './interfaces/paginated-document-list.interface';
import type { IDocumentsService, ListDocumentsParams } from './interfaces/documents-service.interface';
export declare class DocumentsService implements IDocumentsService {
    private readonly documentRepository;
    constructor(documentRepository: IDocumentRepository);
    createDocument(ownerId: string, title: string): Promise<DocumentRecord>;
    listDocuments(ownerId: string, params: ListDocumentsParams): Promise<PaginatedDocumentList>;
    getDocument(ownerId: string, id: string): Promise<DocumentRecord>;
    updateDocumentContent(ownerId: string, id: string, content: string): Promise<DocumentRecord>;
    updateDocumentTitle(ownerId: string, id: string, title: string): Promise<DocumentRecord>;
    removeDocument(ownerId: string, id: string): Promise<void>;
}
