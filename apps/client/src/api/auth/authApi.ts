import type {
  AuthResponse,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
} from '@/domains/authDomains';
import { AuthMethods } from '@/api/MethodNames';
import { executeJsonRequest } from '@/api/http/execute-request';

function authPath(method: AuthMethods): string {
  switch (method) {
    case AuthMethods.Login:
      return '/auth/login';
    case AuthMethods.Register:
      return '/auth/register';
    case AuthMethods.Refresh:
      return '/auth/refresh';
    default: {
      const _e: never = method;
      return _e;
    }
  }
}

function authVerb(
  method: AuthMethods,
): 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' {
  switch (method) {
    case AuthMethods.Login:
    case AuthMethods.Register:
    case AuthMethods.Refresh:
      return 'POST';
    default: {
      const _e: never = method;
      return _e;
    }
  }
}

export const authApi = {
  async login(body: LoginRequest): Promise<AuthResponse> {
    return executeJsonRequest<AuthResponse>({
      method: authVerb(AuthMethods.Login),
      path: authPath(AuthMethods.Login),
      body,
    });
  },

  async register(body: RegisterRequest): Promise<AuthResponse> {
    return executeJsonRequest<AuthResponse>({
      method: authVerb(AuthMethods.Register),
      path: authPath(AuthMethods.Register),
      body,
    });
  },

  async refresh(body: RefreshRequest): Promise<AuthResponse> {
    return executeJsonRequest<AuthResponse>({
      method: authVerb(AuthMethods.Refresh),
      path: authPath(AuthMethods.Refresh),
      body,
    });
  },
} as const;
