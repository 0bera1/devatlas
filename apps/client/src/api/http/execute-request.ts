import { getApiBaseUrl } from '@/lib/api/base-url';
import { parseApiError } from '@/lib/api/parse-api-error';
import { API_NETWORK_ERROR_CODE, type ApiNetworkFailure } from '@/lib/api/api-error';
import {
  DiagramMethods,
  DocumentMethods,
  FeedMethods,
  IntelligenceMethods,
  ProfileMethods,
  SearchMethods,
} from '@/api/MethodNames';

export class HttpRequestError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly code?: typeof API_NETWORK_ERROR_CODE,
  ) {
    super(message);
    this.name = 'HttpRequestError';
  }
}

export function isHttpNetworkError(error: unknown): error is HttpRequestError {
  return (
    error instanceof HttpRequestError &&
    error.code === API_NETWORK_ERROR_CODE
  );
}

export function isNotFoundHttpError(error: unknown): boolean {
  return error instanceof HttpRequestError && error.status === 404;
}

export interface ExecuteJsonRequestOptions {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly path: string;
  readonly accessToken?: string | null;
  readonly body?: unknown;
  readonly extraHeaders?: Readonly<Record<string, string>>;
}

/**
 * Başarılı yanıtta çözümlenmiş gövdeyi döner (axios `response.data` eşleniği).
 */
export async function executeJsonRequest<TResponse>(
  options: ExecuteJsonRequestOptions,
): Promise<TResponse> {
  const url: string = `${getApiBaseUrl()}${options.path}`;
  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.accessToken !== undefined && options.accessToken !== null) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  if (options.extraHeaders !== undefined) {
    for (const [key, value] of Object.entries(options.extraHeaders)) {
      headers[key] = value;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method,
      headers,
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });
  } catch {
    throw new HttpRequestError('', 0, API_NETWORK_ERROR_CODE);
  }

  if (!response.ok) {
    const message: string = await parseApiError(response);
    throw new HttpRequestError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType: string | null = response.headers.get('content-type');
  if (contentType !== null && contentType.includes('application/json')) {
    return (await response.json()) as TResponse;
  }

  return undefined as TResponse;
}

/** Eski api-error ile uyum (query / mutation onError içinde) */
export function toApiFailure(error: unknown): {
  ok: false;
  error: string;
  code?: typeof API_NETWORK_ERROR_CODE;
} {
  if (error instanceof HttpRequestError) {
    if (error.code === API_NETWORK_ERROR_CODE) {
      const n: ApiNetworkFailure = {
        ok: false,
        error: '',
        code: API_NETWORK_ERROR_CODE,
      };
      return n;
    }
    return { ok: false, error: error.message };
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: 'Unknown error' };
}

export function buildDocumentPath(
  method: DocumentMethods,
  params?: { readonly id?: string },
): string {
  switch (method) {
    case DocumentMethods.List:
    case DocumentMethods.Create:
      return '/documents';
    case DocumentMethods.PublicFeed:
      return '/documents/public';
    case DocumentMethods.GetById:
    case DocumentMethods.UpdateContent:
    case DocumentMethods.PatchDocument:
    case DocumentMethods.Delete:
    case DocumentMethods.RecordView:
    case DocumentMethods.FavoriteDocument:
    case DocumentMethods.Related: {
      const id: string | undefined = params?.id;
      if (id === undefined || id.length === 0) {
        throw new HttpRequestError('Document id is required', 400);
      }
      const enc: string = encodeURIComponent(id);
      switch (method) {
        case DocumentMethods.RecordView:
          return `/documents/${enc}/view`;
        case DocumentMethods.FavoriteDocument:
          return `/documents/${enc}/favorite`;
        case DocumentMethods.Related:
          return `/documents/${enc}/related`;
        default:
          return `/documents/${enc}`;
      }
    }
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function buildFeedPath(method: FeedMethods): string {
  switch (method) {
    case FeedMethods.Latest:
      return '/feed/latest';
    case FeedMethods.Trending:
      return '/feed/trending';
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function buildSearchPath(
  method: SearchMethods,
  query: { readonly q: string },
): string {
  switch (method) {
    case SearchMethods.PublicDocuments: {
      const params = new URLSearchParams();
      params.set('q', query.q);
      return `/search?${params.toString()}`;
    }
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function buildDiagramPath(
  method: DiagramMethods,
  params?: { readonly id?: string; readonly userId?: string },
): string {
  switch (method) {
    case DiagramMethods.List:
    case DiagramMethods.Create:
      return '/diagrams';
    case DiagramMethods.GetById:
    case DiagramMethods.SaveGraph:
    case DiagramMethods.Patch:
    case DiagramMethods.Delete:
    case DiagramMethods.Related:
    case DiagramMethods.FavoriteDiagram:
    case DiagramMethods.ListCollaborators:
    case DiagramMethods.AddCollaborator:
    case DiagramMethods.RemoveCollaborator: {
      const id: string | undefined = params?.id;
      if (id === undefined || id.length === 0) {
        throw new HttpRequestError('Diagram id is required', 400);
      }
      const enc: string = encodeURIComponent(id);
      switch (method) {
        case DiagramMethods.SaveGraph:
          return `/diagrams/${enc}`;
        case DiagramMethods.Patch:
          return `/diagrams/${enc}`;
        case DiagramMethods.Delete:
          return `/diagrams/${enc}`;
        case DiagramMethods.Related:
          return `/diagrams/${enc}/related`;
        case DiagramMethods.FavoriteDiagram:
          return `/diagrams/${enc}/favorite`;
        case DiagramMethods.ListCollaborators:
        case DiagramMethods.AddCollaborator:
          return `/diagrams/${enc}/collaborators`;
        case DiagramMethods.RemoveCollaborator: {
          const userId: string | undefined = params?.userId;
          if (userId === undefined || userId.length === 0) {
            throw new HttpRequestError('Collaborator user id is required', 400);
          }
          return `/diagrams/${enc}/collaborators/${encodeURIComponent(userId)}`;
        }
        default:
          return `/diagrams/${enc}`;
      }
    }
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function diagramHttpVerb(
  method: DiagramMethods,
): 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' {
  switch (method) {
    case DiagramMethods.List:
    case DiagramMethods.GetById:
    case DiagramMethods.Related:
    case DiagramMethods.ListCollaborators:
      return 'GET';
    case DiagramMethods.Create:
    case DiagramMethods.AddCollaborator:
    case DiagramMethods.FavoriteDiagram:
      return 'POST';
    case DiagramMethods.SaveGraph:
      return 'PUT';
    case DiagramMethods.Patch:
      return 'PATCH';
    case DiagramMethods.Delete:
    case DiagramMethods.RemoveCollaborator:
      return 'DELETE';
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export interface IntelligencePathParams {
  readonly diagramId?: string;
  readonly documentId?: string;
}

export function buildIntelligencePath(
  method: IntelligenceMethods,
  params: IntelligencePathParams = {},
): string {
  switch (method) {
    case IntelligenceMethods.GetDiagramResources: {
      const id: string | undefined = params.diagramId;
      if (id === undefined || id.length === 0) {
        throw new HttpRequestError('Diagram id is required', 400);
      }
      return `/intelligence/diagrams/${encodeURIComponent(id)}/resources`;
    }
    case IntelligenceMethods.GetDocumentInterviewQuestions: {
      const id: string | undefined = params.documentId;
      if (id === undefined || id.length === 0) {
        throw new HttpRequestError('Document id is required', 400);
      }
      return `/intelligence/documents/${encodeURIComponent(id)}/interview-questions`;
    }
    case IntelligenceMethods.GetAutoTags:
      return '/intelligence/auto-tags';
    case IntelligenceMethods.GenerateDiagram:
      return '/intelligence/diagrams/generate';
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function intelligenceHttpVerb(
  method: IntelligenceMethods,
): 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' {
  switch (method) {
    case IntelligenceMethods.GetDiagramResources:
    case IntelligenceMethods.GetDocumentInterviewQuestions:
      return 'GET';
    case IntelligenceMethods.GetAutoTags:
    case IntelligenceMethods.GenerateDiagram:
      return 'POST';
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export interface ProfilePathParams {
  readonly from?: string;
  readonly to?: string;
}

export function buildProfilePath(
  method: ProfileMethods,
  params: ProfilePathParams = {},
): string {
  switch (method) {
    case ProfileMethods.GetMe:
    case ProfileMethods.UpdateMe:
      return '/profile/me';
    case ProfileMethods.ChangePassword:
      return '/profile/me/password';
    case ProfileMethods.FavoriteDocuments:
      return '/profile/me/favorites/documents';
    case ProfileMethods.FavoriteDiagrams:
      return '/profile/me/favorites/diagrams';
    case ProfileMethods.Activity: {
      const query = new URLSearchParams();
      if (params.from !== undefined) {
        query.set('from', params.from);
      }
      if (params.to !== undefined) {
        query.set('to', params.to);
      }
      const qs: string = query.toString();
      return qs.length === 0
        ? '/profile/me/activity'
        : `/profile/me/activity?${qs}`;
    }
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function profileHttpVerb(
  method: ProfileMethods,
): 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' {
  switch (method) {
    case ProfileMethods.GetMe:
    case ProfileMethods.FavoriteDocuments:
    case ProfileMethods.FavoriteDiagrams:
    case ProfileMethods.Activity:
      return 'GET';
    case ProfileMethods.UpdateMe:
      return 'PATCH';
    case ProfileMethods.ChangePassword:
      return 'POST';
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function documentHttpVerb(
  method: DocumentMethods,
): 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' {
  switch (method) {
    case DocumentMethods.List:
    case DocumentMethods.GetById:
    case DocumentMethods.PublicFeed:
    case DocumentMethods.Related:
      return 'GET';
    case DocumentMethods.Create:
      return 'POST';
    case DocumentMethods.RecordView:
    case DocumentMethods.FavoriteDocument:
      return 'POST';
    case DocumentMethods.UpdateContent:
      return 'PUT';
    case DocumentMethods.PatchDocument:
      return 'PATCH';
    case DocumentMethods.Delete:
      return 'DELETE';
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}
