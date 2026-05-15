import { type Visibility } from '@prisma/client';
import { type IIntelligenceService } from '../intelligence/interfaces/intelligence-service.interface';
import { type IUserActivityService } from '../user-activity/interfaces/user-activity-service.interface';
import type { DocumentRecord } from './interfaces/document-record.interface';
import type { PublicSearchDocumentHit } from './interfaces/public-search-hit.interface';
import { type IDocumentRepository } from './interfaces/document-repository.interface';
import { type IEngagementRepository } from './interfaces/engagement-repository.interface';
import type { PaginatedDocumentList } from './interfaces/paginated-document-list.interface';
import type { CreateDocumentCommand, IDocumentsService, ListDocumentsParams } from './interfaces/documents-service.interface';
export declare class DocumentsService implements IDocumentsService {
    private readonly documentRepository;
    private readonly engagementRepository;
    private readonly intelligenceService;
    private readonly userActivityService;
    constructor(documentRepository: IDocumentRepository, engagementRepository: IEngagementRepository, intelligenceService: IIntelligenceService, userActivityService: IUserActivityService);
    createDocument(ownerId: string, command: CreateDocumentCommand): Promise<DocumentRecord>;
    private resolveCreationTagNames;
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
