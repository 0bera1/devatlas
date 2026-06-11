import type {
  AuthResponse,
  LoginRequest,
  PublicUser,
  RefreshRequest,
  RegisterRequest,
} from '@/domains/auth/authDomains';
import { AuthMethods } from '@/api/MethodNames';
import { apiClient } from '@/api/http/api-client';

function authPath(method: AuthMethods): string {
  switch (method) {
    case AuthMethods.Login:
      return '/auth/login';
    case AuthMethods.Register:
      return '/auth/register';
    case AuthMethods.Refresh:
      return '/auth/refresh';
    case AuthMethods.Profile:
      return '/auth/profile';
    default: {
      const _e: never = method;
      return _e;
    }
  }
}

export const authApi = {
  async login(body: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      authPath(AuthMethods.Login),
      { body },
    );
    return response.data;
  },

  async register(body: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      authPath(AuthMethods.Register),
      { body },
    );
    return response.data;
  },

  async refresh(body: RefreshRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      authPath(AuthMethods.Refresh),
      { body },
    );
    return response.data;
  },

  async getProfile(accessToken: string): Promise<PublicUser> {
    const response = await apiClient.get<PublicUser>(
      authPath(AuthMethods.Profile),
      { accessToken },
    );
    return response.data;
  },
} as const;
