import { DocumentMethods } from '@/api/MethodNames';
import {buildDocumentPath,documentHttpVerb,executeJsonRequest} from '@/api/http/execute-request';
import type {
  CreateDocumentBody,
  DocumentRecord,
  ListDocumentsQuery,
  PaginatedDocumentList,
  PatchDocumentBody,
  UpdateDocumentContentBody,
} from '@/domains/documentsDomains';

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
  return out;
}

export const documentApi = {
  /**
   * GET — halka açık feed (@Public). Kimlik gerekmez.
   */
  async listPublic(): Promise<DocumentRecord[]> {
    return executeJsonRequest<DocumentRecord[]>({
      method: documentHttpVerb(DocumentMethods.PublicFeed),
      path: buildDocumentPath(DocumentMethods.PublicFeed),
    });
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
} as const;
