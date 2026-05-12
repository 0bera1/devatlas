import type {
  AuthResponse,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
} from '@/types/auth';
import { getApiBaseUrl } from '@/lib/api/base-url';
import { parseApiError } from '@/lib/api/parse-api-error';

async function postJson<T>(
  path: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const url = `${getApiBaseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      ok: false,
      error: 'Ağ hatası: API sunucusuna ulaşılamadı.',
    };
  }

  if (!response.ok) {
    const error = await parseApiError(response);
    return { ok: false, error };
  }

  const data = (await response.json()) as T;
  return { ok: true, data };
}

export async function loginRequest(
  payload: LoginRequest,
): Promise<
  { ok: true; data: AuthResponse } | { ok: false; error: string }
> {
  return postJson<AuthResponse>('/auth/login', payload);
}

export async function registerRequest(
  payload: RegisterRequest,
): Promise<
  { ok: true; data: AuthResponse } | { ok: false; error: string }
> {
  return postJson<AuthResponse>('/auth/register', payload);
}

export async function refreshRequest(
  payload: RefreshRequest,
): Promise<
  { ok: true; data: AuthResponse } | { ok: false; error: string }
> {
  return postJson<AuthResponse>('/auth/refresh', payload);
}
