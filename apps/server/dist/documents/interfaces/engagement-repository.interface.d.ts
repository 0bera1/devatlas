export declare const ENGAGEMENT_REPOSITORY: unique symbol;
export interface IEngagementRepository {
    tryCountPublicDocumentView(documentId: string, viewerKey: string, bucketDate: Date): Promise<boolean>;
    insertFavorite(userId: string, documentId: string): Promise<void>;
}
