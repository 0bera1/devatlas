import type { DocumentVisibility } from '../../documents/interfaces/document-record.interface';
export interface FavoriteDiagramEntry {
    id: string;
    title: string;
    ownerId: string;
    visibility: DocumentVisibility;
    favoritedAt: Date;
    updatedAt: Date;
    favoriteCount: number;
    nodeCount: number;
}
