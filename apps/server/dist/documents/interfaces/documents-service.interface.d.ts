import type { Visibility } from '@prisma/client';
import type { DocumentRecord } from './document-record.interface';
import type { PaginatedDocumentList } from './paginated-document-list.interface';
export declare const DOCUMENTS_SERVICE: unique symbol;
export interface ListDocumentsParams {
    page: number;
    pageSize: number;
    titleQuery: string | null;
}
export interface IDocumentsService {
    createDocument(ownerId: string, title: string, visibility?: Visibility): Promise<DocumentRecord>;
    listDocuments(ownerId: string, params: ListDocumentsParams): Promise<PaginatedDocumentList>;
    listPublicDocuments(): Promise<DocumentRecord[]>;
    getDocument(userId: string, id: string): Promise<DocumentRecord>;
    updateDocumentContent(ownerId: string, id: string, content: string): Promise<DocumentRecord>;
    updateDocumentTitle(ownerId: string, id: string, title: string): Promise<DocumentRecord>;
    patchDocument(ownerId: string, id: string, patch: {
        title?: string;
        visibility?: Visibility;
    }): Promise<DocumentRecord>;
    removeDocument(ownerId: string, id: string): Promise<void>;
}
