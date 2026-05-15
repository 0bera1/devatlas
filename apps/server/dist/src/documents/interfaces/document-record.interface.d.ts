import type { DocumentCategorySummary } from './document-category-summary.interface';
export type DocumentVisibility = 'PUBLIC' | 'PRIVATE';
export interface DocumentRecord {
    id: string;
    title: string;
    content: string;
    ownerId: string;
    visibility: DocumentVisibility;
    category: DocumentCategorySummary | null;
    viewCount: number;
    favoriteCount: number;
    createdAt: Date;
    updatedAt: Date;
}
