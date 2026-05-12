export const API_NETWORK_ERROR_CODE = 'network' as const;

export type ApiNetworkFailure = {
  ok: false;
  error: string;
  code: typeof API_NETWORK_ERROR_CODE;
  status?: number;
};

export function createNetworkFailure(): ApiNetworkFailure {
  return { ok: false, error: '', code: API_NETWORK_ERROR_CODE, status: 0 };
}

export function isNetworkFailure(
  result: { ok: false; error: string; code?: string },
): result is ApiNetworkFailure {
  return result.code === API_NETWORK_ERROR_CODE;
}
