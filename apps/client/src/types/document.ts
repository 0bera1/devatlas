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
