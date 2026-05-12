import type { Visibility } from '@prisma/client';
import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { DocumentRecord } from './interfaces/document-record.interface';
import type { CreateDocumentInput, IDocumentRepository } from './interfaces/document-repository.interface';
export declare class DocumentRepository implements IDocumentRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    insertDocument(input: CreateDocumentInput): Promise<DocumentRecord>;
    countAllDocumentsByOwnerId(ownerId: string): Promise<number>;
    countDocumentsByOwnerIdAndTitleContains(ownerId: string, titleSearch: string): Promise<number>;
    selectDocumentsByOwnerIdPage(ownerId: string, skip: number, take: number): Promise<DocumentRecord[]>;
    selectDocumentsByOwnerIdAndTitleContainsPage(ownerId: string, titleSearch: string, skip: number, take: number): Promise<DocumentRecord[]>;
    selectDocumentByIdForUser(id: string, userId: string): Promise<DocumentRecord | null>;
    selectDocumentByIdAndOwnerId(id: string, ownerId: string): Promise<DocumentRecord | null>;
    selectPublicDocumentsOrdered(): Promise<DocumentRecord[]>;
    updateDocumentContentByIdAndOwnerId(id: string, ownerId: string, content: string): Promise<DocumentRecord | null>;
    updateDocumentTitleByIdAndOwnerId(id: string, ownerId: string, title: string): Promise<DocumentRecord | null>;
    updateDocumentPatchByIdAndOwnerId(id: string, ownerId: string, patch: {
        title?: string;
        visibility?: Visibility;
    }): Promise<DocumentRecord | null>;
    deleteDocumentsByIdAndOwnerId(id: string, ownerId: string): Promise<number>;
}
