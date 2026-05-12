import { createNetworkFailure } from '@/lib/api/api-error';
import { getApiBaseUrl } from '@/lib/api/base-url';
import { parseApiError } from '@/lib/api/parse-api-error';
import type {
  CreateDocumentBody,
  DocumentRecord,
  PaginatedDocumentList,
  PatchDocumentTitleBody,
  UpdateDocumentContentBody,
} from '@/types/document';

export interface ListDocumentsQuery {
  page: number;
  pageSize: number;
  /** Boş değilse başlık araması */
  q: string | null;
}

type DocFailure =
  | { ok: false; error: string }
  | ReturnType<typeof createNetworkFailure>;

type DocFailureWithStatus =
  | { ok: false; error: string; status: number }
  | ReturnType<typeof createNetworkFailure>;

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchDocumentsList(
  accessToken: string,
  query: ListDocumentsQuery,
): Promise<
  { ok: true; data: PaginatedDocumentList } | DocFailure
> {
  const params = new URLSearchParams();
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));
  if (query.q !== null && query.q.length > 0) {
    params.set('q', query.q);
  }

  const url = `${getApiBaseUrl()}/documents?${params.toString()}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    return createNetworkFailure();
  }

  if (!response.ok) {
    const error = await parseApiError(response);
    return { ok: false, error };
  }

  const data = (await response.json()) as PaginatedDocumentList;
  return { ok: true, data };
}

export async function fetchDocumentById(
  accessToken: string,
  id: string,
): Promise<
  | { ok: true; data: DocumentRecord }
  | DocFailureWithStatus
> {
  const url = `${getApiBaseUrl()}/documents/${encodeURIComponent(id)}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    return createNetworkFailure();
  }

  if (!response.ok) {
    const error = await parseApiError(response);
    return { ok: false, error, status: response.status };
  }

  const data = (await response.json()) as DocumentRecord;
  return { ok: true, data };
}

export async function createDocumentRequest(
  accessToken: string,
  body: CreateDocumentBody,
): Promise<{ ok: true; data: DocumentRecord } | DocFailure> {
  const url = `${getApiBaseUrl()}/documents`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
  } catch {
    return createNetworkFailure();
  }

  if (!response.ok) {
    const error = await parseApiError(response);
    return { ok: false, error };
  }

  const data = (await response.json()) as DocumentRecord;
  return { ok: true, data };
}

export async function updateDocumentContentRequest(
  accessToken: string,
  id: string,
  body: UpdateDocumentContentBody,
): Promise<{ ok: true; data: DocumentRecord } | DocFailure> {
  const url = `${getApiBaseUrl()}/documents/${encodeURIComponent(id)}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PUT',
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
  } catch {
    return createNetworkFailure();
  }

  if (!response.ok) {
    const error = await parseApiError(response);
    return { ok: false, error };
  }

  const data = (await response.json()) as DocumentRecord;
  return { ok: true, data };
}

export async function patchDocumentTitleRequest(
  accessToken: string,
  id: string,
  body: PatchDocumentTitleBody,
): Promise<{ ok: true; data: DocumentRecord } | DocFailure> {
  const url = `${getApiBaseUrl()}/documents/${encodeURIComponent(id)}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
  } catch {
    return createNetworkFailure();
  }

  if (!response.ok) {
    const error = await parseApiError(response);
    return { ok: false, error };
  }

  const data = (await response.json()) as DocumentRecord;
  return { ok: true, data };
}

export async function deleteDocumentRequest(
  accessToken: string,
  id: string,
): Promise<{ ok: true } | DocFailure> {
  const url = `${getApiBaseUrl()}/documents/${encodeURIComponent(id)}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    return createNetworkFailure();
  }

  if (response.status === 204) {
    return { ok: true };
  }

  const error = await parseApiError(response);
  return { ok: false, error };
}
