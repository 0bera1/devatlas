import type { DocumentRecord } from './document-record.interface';
import type { PaginatedDocumentList } from './paginated-document-list.interface';

export const DOCUMENTS_SERVICE: unique symbol = Symbol('DOCUMENTS_SERVICE');

export interface ListDocumentsParams {
  page: number;
  pageSize: number;
  /** Boş / yok: filtre yok; dolu: başlıkta case-insensitive arama */
  titleQuery: string | null;
}

export interface IDocumentsService {
  createDocument(ownerId: string, title: string): Promise<DocumentRecord>;
  listDocuments(
    ownerId: string,
    params: ListDocumentsParams,
  ): Promise<PaginatedDocumentList>;
  getDocument(ownerId: string, id: string): Promise<DocumentRecord>;
  updateDocumentContent(
    ownerId: string,
    id: string,
    content: string,
  ): Promise<DocumentRecord>;
  updateDocumentTitle(
    ownerId: string,
    id: string,
    title: string,
  ): Promise<DocumentRecord>;
  removeDocument(ownerId: string, id: string): Promise<void>;
}
