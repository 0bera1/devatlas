import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { IEngagementRepository } from './interfaces/engagement-repository.interface';
export declare class EngagementRepository implements IEngagementRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    tryCountPublicDocumentView(documentId: string, viewerKey: string, bucketDate: Date): Promise<boolean>;
    insertFavorite(userId: string, documentId: string): Promise<void>;
}
