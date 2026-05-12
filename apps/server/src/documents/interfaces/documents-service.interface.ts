import type { Visibility } from '@prisma/client';
import type { DocumentRecord } from './document-record.interface';
import type { PaginatedDocumentList } from './paginated-document-list.interface';
import type { PublicSearchDocumentHit } from './public-search-hit.interface';

export const DOCUMENTS_SERVICE: unique symbol = Symbol('DOCUMENTS_SERVICE');

export interface CreateDocumentCommand {
  readonly title: string;
  readonly visibility?: Visibility;
  /** Tek makro kategori adı; servis normalize eder. */
  readonly categoryName?: string;
  /** Ham etiket dizeleri; servis normalize eder. */
  readonly tags?: readonly string[];
}

export interface ListDocumentsParams {
  page: number;
  pageSize: number;
  /** Boş / yok: filtre yok; dolu: başlıkta case-insensitive arama */
  titleQuery: string | null;
}

export interface IDocumentsService {
  createDocument(
    ownerId: string,
    command: CreateDocumentCommand,
  ): Promise<DocumentRecord>;
  listDocuments(
    ownerId: string,
    params: ListDocumentsParams,
  ): Promise<PaginatedDocumentList>;
  listPublicDocuments(): Promise<DocumentRecord[]>;
  getDocument(userId: string, id: string): Promise<DocumentRecord>;
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
  patchDocument(
    ownerId: string,
    id: string,
    patch: {
      title?: string;
      visibility?: Visibility;
      categoryName?: string | null;
    },
  ): Promise<DocumentRecord>;
  removeDocument(ownerId: string, id: string): Promise<void>;

  /** AŞAMA 2 — public feed (son yayınlar). */
  getLatestPublicFeed(): Promise<DocumentRecord[]>;

  /** AŞAMA 3 — basit trending (favoriteCount, viewCount sıralaması). */
  getTrendingPublicFeed(): Promise<DocumentRecord[]>;

  /**
   * PUBLIC doküman için görüntülenme sayımı (günde en fazla bir kez / viewerKey).
   */
  recordPublicDocumentView(
    documentId: string,
    viewerKey: string,
  ): Promise<boolean>;

  /** Favori + favoriteCount; tekrar için Conflict. */
  addFavorite(userId: string, documentId: string): Promise<void>;

  /**
   * Keşif: herkese açık dokümanlarda başlık, içerik, etiket veya kategori adı araması; boş sorgu → [].
   */
  searchPublicDocuments(rawQuery: string): Promise<PublicSearchDocumentHit[]>;

  /**
   * Kaynak dokümanı görebilen izleyici için: aynı kategori + ortak etiketli diğer PUBLIC dokümanlar.
   */
  getRelatedDocuments(
    documentId: string,
    viewerUserId: string | null,
  ): Promise<DocumentRecord[]>;
}
