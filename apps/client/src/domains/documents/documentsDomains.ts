/** Doküman (documents) domain modelleri — API ve mutation değişkenleri. */

export type DocumentVisibility = 'PUBLIC' | 'PRIVATE';

export interface DocumentCategorySummary {
  id: string;
  name: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  visibility: DocumentVisibility;
  category: DocumentCategorySummary | null;
  viewCount: number;
  favoriteCount: number;
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
  /** Opsiyonel etiketler; boş dizi gönderilmez. */
  tags?: string[];
  /** Tek makro kategori (ör. backend); sunucu normalize eder. */
  categoryName?: string;
}

export interface UpdateDocumentContentBody {
  content: string;
}

export interface PatchDocumentBody {
  title?: string;
  visibility?: DocumentVisibility;
  /** Boş dize veya null ile kategori kaldırılır (PATCH gövdesi). */
  categoryName?: string | null;
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

export interface RecordDocumentViewResponse {
  counted: boolean;
  anonymousId?: string;
}
