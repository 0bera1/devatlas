import type { FavoriteDiagramEntry } from './favorite-diagram-entry.interface';
import type { FavoriteDocumentEntry } from './favorite-document-entry.interface';
export declare const PROFILE_REPOSITORY: unique symbol;
export interface IProfileRepository {
    selectFavoriteDocumentsByUserId(userId: string): Promise<FavoriteDocumentEntry[]>;
    selectFavoriteDiagramsByUserId(userId: string): Promise<FavoriteDiagramEntry[]>;
}
