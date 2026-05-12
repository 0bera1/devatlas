/** Doküman (documents) domain modelleri — API ve mutation değişkenleri. */

export type DocumentVisibility = 'PUBLIC' | 'PRIVATE';

export interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  visibility: DocumentVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDocumentList {
  items: DocumentRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateDocumentBody {
  title: string;
  visibility?: DocumentVisibility;
}

export interface UpdateDocumentContentBody {
  content: string;
}

export interface PatchDocumentBody {
  title?: string;
  visibility?: DocumentVisibility;
}

export interface ListDocumentsQuery {
  page: number;
  pageSize: number;
  q: string | null;
}

export interface PatchDocumentVariables {
  readonly documentId: string;
  readonly patch: PatchDocumentBody;
}

export interface UpdateDocumentContentVariables {
  readonly documentId: string;
  readonly content: string;
}
