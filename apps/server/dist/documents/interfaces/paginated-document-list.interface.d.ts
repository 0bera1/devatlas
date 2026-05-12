import type { DocumentRecord } from './document-record.interface';
export interface PaginatedDocumentList {
    items: DocumentRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
