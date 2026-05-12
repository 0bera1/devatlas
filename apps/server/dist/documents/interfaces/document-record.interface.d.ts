export type DocumentVisibility = 'PUBLIC' | 'PRIVATE';
export interface DocumentRecord {
    id: string;
    title: string;
    content: string;
    ownerId: string;
    visibility: DocumentVisibility;
    createdAt: Date;
    updatedAt: Date;
}
