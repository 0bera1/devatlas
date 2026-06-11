import { getApiBaseUrl } from '@/lib/api/base-url';
import { parseApiError } from '@/lib/api/parse-api-error';
import {
  API_NETWORK_ERROR_CODE,
  type ApiNetworkFailure,
} from '@/lib/api/api-error';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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

export interface ApiClientRequestConfig {
  readonly accessToken?: string | null;
  readonly body?: unknown;
  readonly headers?: Readonly<Record<string, string>>;
}

export interface ApiClientResponse<TData> {
  readonly data: TData;
  readonly status: number;
}

export class ApiClient {
  public constructor(
    private readonly resolveBaseUrl: () => string = getApiBaseUrl,
  ) {}

  public async get<TData>(
    path: string,
    config?: ApiClientRequestConfig,
  ): Promise<ApiClientResponse<TData>> {
    return this.request<TData>('GET', path, config);
  }

  public async post<TData>(
    path: string,
    config?: ApiClientRequestConfig,
  ): Promise<ApiClientResponse<TData>> {
    return this.request<TData>('POST', path, config);
  }

  public async put<TData>(
    path: string,
    config?: ApiClientRequestConfig,
  ): Promise<ApiClientResponse<TData>> {
    return this.request<TData>('PUT', path, config);
  }

  public async patch<TData>(
    path: string,
    config?: ApiClientRequestConfig,
  ): Promise<ApiClientResponse<TData>> {
    return this.request<TData>('PATCH', path, config);
  }

  public async delete<TData = void>(
    path: string,
    config?: ApiClientRequestConfig,
  ): Promise<ApiClientResponse<TData>> {
    return this.request<TData>('DELETE', path, config);
  }

  private async request<TData>(
    method: HttpMethod,
    path: string,
    config: ApiClientRequestConfig = {},
  ): Promise<ApiClientResponse<TData>> {
    const url: string = `${this.resolveBaseUrl()}${path}`;
    const headers: Record<string, string> = {};

    if (config.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (config.accessToken !== undefined && config.accessToken !== null) {
      headers.Authorization = `Bearer ${config.accessToken}`;
    }

    if (config.headers !== undefined) {
      for (const [key, value] of Object.entries(config.headers)) {
        headers[key] = value;
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body:
          config.body !== undefined
            ? JSON.stringify(config.body)
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
      return { data: undefined as TData, status: response.status };
    }

    const contentType: string | null = response.headers.get('content-type');
    if (contentType !== null && contentType.includes('application/json')) {
      const data: TData = (await response.json()) as TData;
      return { data, status: response.status };
    }

    return { data: undefined as TData, status: response.status };
  }
}

export const apiClient: ApiClient = new ApiClient();
