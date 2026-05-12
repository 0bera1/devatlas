export const ENGAGEMENT_REPOSITORY: unique symbol = Symbol(
  'ENGAGEMENT_REPOSITORY',
);

export interface IEngagementRepository {
  /**
   * Yalnızca PUBLIC dokümanlar. İlk kez bu gün için bu viewerKey ise viewCount +1 ve true.
   * Aynı gün tekrarında false (sayım yok).
   */
  tryCountPublicDocumentView(
    documentId: string,
    viewerKey: string,
    bucketDate: Date,
  ): Promise<boolean>;

  /**
   * Favorite satırı + favoriteCount atomik artışı. Unique ihlalinde Prisma P2002 fırlatır.
   */
  insertFavorite(userId: string, documentId: string): Promise<void>;
}
