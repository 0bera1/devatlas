import { DocumentMethods, FeedMethods, SearchMethods } from '@/api/MethodNames';
import { apiClient } from '@/api/http/api-client';
import {
  buildDocumentPath,
  buildFeedPath,
  buildSearchPath,
} from '@/api/http/execute-request';
import type {
  CreateDocumentBody,
  DocumentRecord,
  ListDocumentsQuery,
  PaginatedDocumentList,
  PatchDocumentBody,
  RecordDocumentViewResponse,
  UpdateDocumentContentBody,
} from '@/domains/documents/documentsDomains';
import type { PublicSearchHit } from '@/domains/search/searchDomains';

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
    const response = await apiClient.get<DocumentRecord[]>(
      buildFeedPath(FeedMethods.Latest),
    );
    return response.data;
  },

  /**
   * GET /feed/trending — favoriteCount, ardından viewCount azalan.
   */
  async listFeedTrending(): Promise<DocumentRecord[]> {
    const response = await apiClient.get<DocumentRecord[]>(
      buildFeedPath(FeedMethods.Trending),
    );
    return response.data;
  },

  /**
   * GET /search?q= — herkese açık dokümanlar (önizleme + yazar).
   */
  async searchPublic(trimmedQuery: string): Promise<PublicSearchHit[]> {
    const q: string = trimmedQuery.trim();
    if (q.length === 0) {
      return [];
    }
    const response = await apiClient.get<PublicSearchHit[]>(
      buildSearchPath(SearchMethods.PublicDocuments, { q }),
    );
    return response.data;
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
    const response = await apiClient.get<PaginatedDocumentList>(path, {
      accessToken,
    });
    return response.data;
  },

  /**
   * POST — {@link DocumentMethods.Create}
   */
  async create(
    accessToken: string,
    body: CreateDocumentBody,
  ): Promise<DocumentRecord> {
    const response = await apiClient.post<DocumentRecord>(
      buildDocumentPath(DocumentMethods.Create),
      { accessToken, body },
    );
    return response.data;
  },

  /**
   * GET — {@link DocumentMethods.GetById}
   */
  async getById(
    accessToken: string,
    documentId: string,
  ): Promise<DocumentRecord> {
    const response = await apiClient.get<DocumentRecord>(
      buildDocumentPath(DocumentMethods.GetById, { id: documentId }),
      { accessToken },
    );
    return response.data;
  },

  /**
   * GET /documents/:id/related — aynı kategori + ortak etiket (PUBLIC adaylar).
   * Özel doküman için Bearer gerekir.
   */
  async listRelated(
    documentId: string,
    accessToken: string | null | undefined,
  ): Promise<DocumentRecord[]> {
    const response = await apiClient.get<DocumentRecord[]>(
      buildDocumentPath(DocumentMethods.Related, { id: documentId }),
      { accessToken: accessToken ?? undefined },
    );
    return response.data;
  },

  /**
   * PUT — {@link DocumentMethods.UpdateContent}
   */
  async updateContent(
    accessToken: string,
    documentId: string,
    body: UpdateDocumentContentBody,
  ): Promise<DocumentRecord> {
    const response = await apiClient.put<DocumentRecord>(
      buildDocumentPath(DocumentMethods.UpdateContent, { id: documentId }),
      { accessToken, body },
    );
    return response.data;
  },

  /**
   * PATCH — başlık ve/veya görünürlük (yalnızca owner).
   */
  async patchDocument(
    accessToken: string,
    documentId: string,
    patch: PatchDocumentBody,
  ): Promise<DocumentRecord> {
    const response = await apiClient.patch<DocumentRecord>(
      buildDocumentPath(DocumentMethods.PatchDocument, { id: documentId }),
      { accessToken, body: compactPatch(patch) },
    );
    return response.data;
  },

  /**
   * DELETE — {@link DocumentMethods.Delete}
   */
  async remove(
    accessToken: string,
    documentId: string,
  ): Promise<void> {
    await apiClient.delete<void>(
      buildDocumentPath(DocumentMethods.Delete, { id: documentId }),
      { accessToken },
    );
  },

  /**
   * POST /documents/:id/view — PUBLIC doküman görüntülenme (günde bir kez / izleyici).
   */
  async recordView(
    documentId: string,
    accessToken: string | null | undefined,
    anonymousId: string | null | undefined,
  ): Promise<RecordDocumentViewResponse> {
    const headers: Record<string, string> = {};
    if (
      anonymousId !== undefined &&
      anonymousId !== null &&
      anonymousId.trim().length > 0
    ) {
      headers['X-Anonymous-Id'] = anonymousId.trim();
    }
    const response = await apiClient.post<RecordDocumentViewResponse>(
      buildDocumentPath(DocumentMethods.RecordView, { id: documentId }),
      {
        accessToken: accessToken ?? undefined,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      },
    );
    return response.data;
  },

  /**
   * POST /documents/:id/favorite — favori + favoriteCount (+1).
   */
  async addFavorite(accessToken: string, documentId: string): Promise<void> {
    await apiClient.post<void>(
      buildDocumentPath(DocumentMethods.FavoriteDocument, { id: documentId }),
      { accessToken },
    );
  },
} as const;
