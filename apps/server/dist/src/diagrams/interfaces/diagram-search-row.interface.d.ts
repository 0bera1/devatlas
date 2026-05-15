import type { DocumentVisibility } from '../../documents/interfaces/document-record.interface';
import type { PublicSearchDocumentAuthor } from '../../documents/interfaces/public-search-hit.interface';
export interface DiagramSearchRow {
    id: string;
    title: string;
    ownerId: string;
    visibility: DocumentVisibility;
    createdAt: Date;
    updatedAt: Date;
    owner: PublicSearchDocumentAuthor;
    nodeLabels: string[];
}
