import type { DocumentVisibility } from './document-record.interface';
export interface DocumentSearchRow {
    id: string;
    title: string;
    content: string;
    ownerId: string;
    visibility: DocumentVisibility;
    viewCount: number;
    favoriteCount: number;
    createdAt: Date;
    updatedAt: Date;
    owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}
