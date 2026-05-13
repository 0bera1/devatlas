import type { DocumentVisibility } from '../../documents/interfaces/document-record.interface';
export interface FavoriteDocumentEntry {
    id: string;
    title: string;
    ownerId: string;
    visibility: DocumentVisibility;
    favoritedAt: Date;
    updatedAt: Date;
    favoriteCount: number;
    viewCount: number;
}
