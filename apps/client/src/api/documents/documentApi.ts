import { DocumentMethods, FeedMethods, SearchMethods } from '@/api/MethodNames';
import {
  buildDocumentPath,
  buildFeedPath,
  buildSearchPath,
  documentHttpVerb,
  executeJsonRequest,
} from '@/api/http/execute-request';
import type {
  CreateDocumentBody,
  DocumentRecord,
  ListDocumentsQuery,
  PaginatedDocumentList,
  PatchDocumentBody,
  RecordDocumentViewResponse,
  UpdateDocumentContentBody,
} from '@/domains/documentsDomains';
import type { PublicSearchHit } from '@/domains/searchDomains';

function appendListQuery(basePath: string, query: ListDocumentsQuery): string {
  const params = new URLSearchParams();
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));
  if (query.q !== null && query.q.length > 0) {
    params.set('q', query.q);
  }
  const qs: string = params.toString();
  return qs.length > 0 ? `${basePath}?${qs}` : basePath;
}

function compactPatch(patch: PatchDocumentBody): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.title !== undefined) {
    out.title = patch.title;
  }
  if (patch.visibility !== undefined) {
    out.visibility = patch.visibility;
  }
  if (patch.categoryName !== undefined) {
    out.categoryName = patch.categoryName;
  }
  return out;
}

export const documentApi = {
  /**
   * GET /feed/latest — son herkese açık dokümanlar.
   */
  async listFeedLatest(): Promise<DocumentRecord[]> {
    return executeJsonRequest<DocumentRecord[]>({
      method: 'GET',
      path: buildFeedPath(FeedMethods.Latest),
    });
  },

  /**
   * GET /feed/trending — favoriteCount, ardından viewCount azalan.
   */
  async listFeedTrending(): Promise<DocumentRecord[]> {
    return executeJsonRequest<DocumentRecord[]>({
      method: 'GET',
      path: buildFeedPath(FeedMethods.Trending),
    });
  },

  /**
   * GET /search?q= — herkese açık dokümanlar (önizleme + yazar).
   */
  async searchPublic(trimmedQuery: string): Promise<PublicSearchHit[]> {
    const q: string = trimmedQuery.trim();
    if (q.length === 0) {
      return [];
    }
    return executeJsonRequest<PublicSearchHit[]>({
      method: 'GET',
      path: buildSearchPath(SearchMethods.PublicDocuments, { q }),
    });
  },

  /**
   * Eski isim; /feed/latest ile aynı sonuç.
   */
  async listPublic(): Promise<DocumentRecord[]> {
    return documentApi.listFeedLatest();
  },

  /**
   * GET — {@link DocumentMethods.List}
   */
  async list(
    accessToken: string,
    query: ListDocumentsQuery,
  ): Promise<PaginatedDocumentList> {
    const base: string = buildDocumentPath(DocumentMethods.List);
    const path: string = appendListQuery(base, query);
    return executeJsonRequest<PaginatedDocumentList>({
      method: documentHttpVerb(DocumentMethods.List),
      path,
      accessToken,
    });
  },

  /**
   * POST — {@link DocumentMethods.Create}
   */
  async create(
    accessToken: string,
    body: CreateDocumentBody,
  ): Promise<DocumentRecord> {
    return executeJsonRequest<DocumentRecord>({
      method: documentHttpVerb(DocumentMethods.Create),
      path: buildDocumentPath(DocumentMethods.Create),
      accessToken,
      body,
    });
  },

  /**
   * GET — {@link DocumentMethods.GetById}
   */
  async getById(
    accessToken: string,
    documentId: string,
  ): Promise<DocumentRecord> {
    return executeJsonRequest<DocumentRecord>({
      method: documentHttpVerb(DocumentMethods.GetById),
      path: buildDocumentPath(DocumentMethods.GetById, { id: documentId }),
      accessToken,
    });
  },

  /**
   * GET /documents/:id/related — aynı kategori + ortak etiket (PUBLIC adaylar).
   * Özel doküman için Bearer gerekir.
   */
  async listRelated(
    documentId: string,
    accessToken: string | null | undefined,
  ): Promise<DocumentRecord[]> {
    return executeJsonRequest<DocumentRecord[]>({
      method: documentHttpVerb(DocumentMethods.Related),
      path: buildDocumentPath(DocumentMethods.Related, { id: documentId }),
      accessToken: accessToken ?? undefined,
    });
  },

  /**
   * PUT — {@link DocumentMethods.UpdateContent}
   */
  async updateContent(
    accessToken: string,
    documentId: string,
    body: UpdateDocumentContentBody,
  ): Promise<DocumentRecord> {
    return executeJsonRequest<DocumentRecord>({
      method: documentHttpVerb(DocumentMethods.UpdateContent),
      path: buildDocumentPath(DocumentMethods.UpdateContent, {
        id: documentId,
      }),
      accessToken,
      body,
    });
  },

  /**
   * PATCH — başlık ve/veya görünürlük (yalnızca owner).
   */
  async patchDocument(
    accessToken: string,
    documentId: string,
    patch: PatchDocumentBody,
  ): Promise<DocumentRecord> {
    return executeJsonRequest<DocumentRecord>({
      method: documentHttpVerb(DocumentMethods.PatchDocument),
      path: buildDocumentPath(DocumentMethods.PatchDocument, {
        id: documentId,
      }),
      accessToken,
      body: compactPatch(patch),
    });
  },

  /**
   * DELETE — {@link DocumentMethods.Delete}
   */
  async remove(
    accessToken: string,
    documentId: string,
  ): Promise<void> {
    await executeJsonRequest<void>({
      method: documentHttpVerb(DocumentMethods.Delete),
      path: buildDocumentPath(DocumentMethods.Delete, { id: documentId }),
      accessToken,
    });
  },

  /**
   * POST /documents/:id/view — PUBLIC doküman görüntülenme (günde bir kez / izleyici).
   */
  async recordView(
    documentId: string,
    accessToken: string | null | undefined,
    anonymousId: string | null | undefined,
  ): Promise<RecordDocumentViewResponse> {
    const extra: Record<string, string> = {};
    if (
      anonymousId !== undefined &&
      anonymousId !== null &&
      anonymousId.trim().length > 0
    ) {
      extra['X-Anonymous-Id'] = anonymousId.trim();
    }
    return executeJsonRequest<RecordDocumentViewResponse>({
      method: documentHttpVerb(DocumentMethods.RecordView),
      path: buildDocumentPath(DocumentMethods.RecordView, { id: documentId }),
      accessToken: accessToken ?? undefined,
      extraHeaders: Object.keys(extra).length > 0 ? extra : undefined,
    });
  },

  /**
   * POST /documents/:id/favorite — favori + favoriteCount (+1).
   */
  async addFavorite(accessToken: string, documentId: string): Promise<void> {
    await executeJsonRequest<void>({
      method: documentHttpVerb(DocumentMethods.FavoriteDocument),
      path: buildDocumentPath(DocumentMethods.FavoriteDocument, {
        id: documentId,
      }),
      accessToken,
    });
  },
} as const;
