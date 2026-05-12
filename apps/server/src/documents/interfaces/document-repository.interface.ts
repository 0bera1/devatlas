import type { Visibility } from '@prisma/client';
import type { DocumentRecord } from './document-record.interface';
import type { DocumentSearchRow } from './document-search-row.interface';

export const DOCUMENT_REPOSITORY: unique symbol = Symbol('DOCUMENT_REPOSITORY');

export interface CreateDocumentInput {
  ownerId: string;
  title: string;
  visibility?: Visibility;
  /** Normalize edilmiş kategori adı (Category.name); yoksa kategori atanmaz. */
  categoryName?: string;
  /** Normalize edilmiş tekil etiket adları (Tag.name). */
  tagNames?: readonly string[];
}

export interface IDocumentRepository {
  insertDocument(input: CreateDocumentInput): Promise<DocumentRecord>;
  countAllDocumentsByOwnerId(ownerId: string): Promise<number>;
  countDocumentsByOwnerIdAndTitleContains(
    ownerId: string,
    titleSearch: string,
  ): Promise<number>;
  selectDocumentsByOwnerIdPage(
    ownerId: string,
    skip: number,
    take: number,
  ): Promise<DocumentRecord[]>;
  selectDocumentsByOwnerIdAndTitleContainsPage(
    ownerId: string,
    titleSearch: string,
    skip: number,
    take: number,
  ): Promise<DocumentRecord[]>;
  /** Okuma: yalnızca herkese açık doküman (anonim izleyici). */
  selectDocumentByIdPublicOnly(id: string): Promise<DocumentRecord | null>;
  /** Okuma: PUBLIC veya istenen kullanıcının sahibi olduğu doküman. */
  selectDocumentByIdForUser(
    id: string,
    userId: string,
  ): Promise<DocumentRecord | null>;
  /** Yazma/silme öncesi: yalnızca owner. */
  selectDocumentByIdAndOwnerId(
    id: string,
    ownerId: string,
  ): Promise<DocumentRecord | null>;
  selectPublicDocumentsOrdered(): Promise<DocumentRecord[]>;
  selectPublicFeedLatest(take: number): Promise<DocumentRecord[]>;
  selectPublicFeedTrending(take: number): Promise<DocumentRecord[]>;

  /**
   * PUBLIC dokümanlarda başlık, içerik, bağlı etiket veya kategori adında `contains` + case-insensitive.
   */
  selectPublicDocumentsByQuery(
    searchTerm: string,
    take: number,
  ): Promise<DocumentSearchRow[]>;

  /**
   * Kaynak dokümanla aynı kategori (veya ikisi de kategorisiz) ve en az bir ortak etiket;
   * yalnız PUBLIC adaylar; kaynak hariç.
   */
  selectPublicRelatedDocumentsBySharedTagsAndCategory(
    sourceDocumentId: string,
    take: number,
  ): Promise<DocumentRecord[]>;

  updateDocumentContentByIdAndOwnerId(
    id: string,
    ownerId: string,
    content: string,
  ): Promise<DocumentRecord | null>;
  updateDocumentTitleByIdAndOwnerId(
    id: string,
    ownerId: string,
    title: string,
  ): Promise<DocumentRecord | null>;
  updateDocumentPatchByIdAndOwnerId(
    id: string,
    ownerId: string,
    patch: {
      title?: string;
      visibility?: Visibility;
      categoryName?: string | null;
    },
  ): Promise<DocumentRecord | null>;
  deleteDocumentsByIdAndOwnerId(id: string, ownerId: string): Promise<number>;
}
