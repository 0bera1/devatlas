import { getApiBaseUrl } from '@/lib/api/base-url';
import { parseApiError } from '@/lib/api/parse-api-error';
import { API_NETWORK_ERROR_CODE, type ApiNetworkFailure } from '@/lib/api/api-error';
import { DocumentMethods } from '@/api/MethodNames';

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
}

/**
 * Başarılı yanıtta çözümlenmiş gövdeyi döner (axios `response.data` eşleniği).
 */
export async function executeJsonRequest<TResponse>(
  options: ExecuteJsonRequestOptions,
): Promise<TResponse> {
  const url: string = `${getApiBaseUrl()}${options.path}`;
  const headers: HeadersInit = {};

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.accessToken !== undefined && options.accessToken !== null) {
    headers.Authorization = `Bearer ${options.accessToken}`;
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
    case DocumentMethods.GetById:
    case DocumentMethods.UpdateContent:
    case DocumentMethods.PatchTitle:
    case DocumentMethods.Delete: {
      const id: string | undefined = params?.id;
      if (id === undefined || id.length === 0) {
        throw new HttpRequestError('Document id is required', 400);
      }
      return `/documents/${encodeURIComponent(id)}`;
    }
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
      return 'GET';
    case DocumentMethods.Create:
      return 'POST';
    case DocumentMethods.UpdateContent:
      return 'PUT';
    case DocumentMethods.PatchTitle:
      return 'PATCH';
    case DocumentMethods.Delete:
      return 'DELETE';
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}
