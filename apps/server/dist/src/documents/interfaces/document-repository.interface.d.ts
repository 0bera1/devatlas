import type { Visibility } from '@prisma/client';
import type { DocumentRecord } from './document-record.interface';
import type { DocumentSearchRow } from './document-search-row.interface';
export declare const DOCUMENT_REPOSITORY: unique symbol;
export interface CreateDocumentInput {
    ownerId: string;
    title: string;
    visibility?: Visibility;
    categoryName?: string;
    tagNames?: readonly string[];
}
export interface IDocumentRepository {
    insertDocument(input: CreateDocumentInput): Promise<DocumentRecord>;
    countAllDocumentsByOwnerId(ownerId: string): Promise<number>;
    countDocumentsByOwnerIdAndTitleContains(ownerId: string, titleSearch: string): Promise<number>;
    selectDocumentsByOwnerIdPage(ownerId: string, skip: number, take: number): Promise<DocumentRecord[]>;
    selectDocumentsByOwnerIdAndTitleContainsPage(ownerId: string, titleSearch: string, skip: number, take: number): Promise<DocumentRecord[]>;
    selectDocumentByIdPublicOnly(id: string): Promise<DocumentRecord | null>;
    selectDocumentByIdForUser(id: string, userId: string): Promise<DocumentRecord | null>;
    selectDocumentByIdAndOwnerId(id: string, ownerId: string): Promise<DocumentRecord | null>;
    selectPublicDocumentsOrdered(): Promise<DocumentRecord[]>;
    selectPublicFeedLatest(take: number): Promise<DocumentRecord[]>;
    selectPublicFeedTrending(take: number): Promise<DocumentRecord[]>;
    selectPublicDocumentsByQuery(searchTerm: string, take: number): Promise<DocumentSearchRow[]>;
    selectPublicRelatedDocumentsBySharedTagsAndCategory(sourceDocumentId: string, take: number): Promise<DocumentRecord[]>;
    updateDocumentContentByIdAndOwnerId(id: string, ownerId: string, content: string): Promise<DocumentRecord | null>;
    updateDocumentTitleByIdAndOwnerId(id: string, ownerId: string, title: string): Promise<DocumentRecord | null>;
    updateDocumentPatchByIdAndOwnerId(id: string, ownerId: string, patch: {
        title?: string;
        visibility?: Visibility;
        categoryName?: string | null;
    }): Promise<DocumentRecord | null>;
    deleteDocumentsByIdAndOwnerId(id: string, ownerId: string): Promise<number>;
}
