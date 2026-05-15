import type { Visibility } from '@prisma/client';
import type { DocumentRecord } from './document-record.interface';
import type { PaginatedDocumentList } from './paginated-document-list.interface';
import type { PublicSearchDocumentHit } from './public-search-hit.interface';
export declare const DOCUMENTS_SERVICE: unique symbol;
export interface CreateDocumentCommand {
    readonly title: string;
    readonly visibility?: Visibility;
    readonly categoryName?: string;
    readonly tags?: readonly string[];
}
export interface ListDocumentsParams {
    page: number;
    pageSize: number;
    titleQuery: string | null;
}
export interface IDocumentsService {
    createDocument(ownerId: string, command: CreateDocumentCommand): Promise<DocumentRecord>;
    listDocuments(ownerId: string, params: ListDocumentsParams): Promise<PaginatedDocumentList>;
    listPublicDocuments(): Promise<DocumentRecord[]>;
    getDocument(userId: string, id: string): Promise<DocumentRecord>;
    updateDocumentContent(ownerId: string, id: string, content: string): Promise<DocumentRecord>;
    updateDocumentTitle(ownerId: string, id: string, title: string): Promise<DocumentRecord>;
    patchDocument(ownerId: string, id: string, patch: {
        title?: string;
        visibility?: Visibility;
        categoryName?: string | null;
    }): Promise<DocumentRecord>;
    removeDocument(ownerId: string, id: string): Promise<void>;
    getLatestPublicFeed(): Promise<DocumentRecord[]>;
    getTrendingPublicFeed(): Promise<DocumentRecord[]>;
    recordPublicDocumentView(documentId: string, viewerKey: string): Promise<boolean>;
    addFavorite(userId: string, documentId: string): Promise<void>;
    searchPublicDocuments(rawQuery: string): Promise<PublicSearchDocumentHit[]>;
    getRelatedDocuments(documentId: string, viewerUserId: string | null): Promise<DocumentRecord[]>;
}
