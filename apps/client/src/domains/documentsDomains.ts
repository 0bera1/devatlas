/** Doküman (documents) domain modelleri — API ve mutation değişkenleri. */

export interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  ownerId: string;
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
}

export interface UpdateDocumentContentBody {
  content: string;
}

export interface PatchDocumentTitleBody {
  title: string;
}

export interface ListDocumentsQuery {
  page: number;
  pageSize: number;
  q: string | null;
}

export interface PatchDocumentTitleVariables {
  readonly documentId: string;
  readonly title: string;
}

export interface UpdateDocumentContentVariables {
  readonly documentId: string;
  readonly content: string;
}
