'use client';

import { authApi } from '@/api/auth/authApi';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const ACCESS_TOKEN_KEY = 'devatlas_access_token';
const REFRESH_TOKEN_KEY = 'devatlas_refresh_token';

export interface AuthSessionPayload {
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextValue {
  token: string | null;
  refreshToken: string | null;
  isReady: boolean;
  setSession: (session: AuthSessionPayload) => void;
  clearSession: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  /**
   * Access JWT kısa ömürlü (ör. 10 dk). Yenileme yalnızca periyodik çalışırsa,
   * sekmeyi sonra açan kullanıcıda access süresi dolmuş olur ve /documents 401 verir.
   * Refresh token varsa uygulama açılışında bir kez oturum yenilenir; isReady buna göre gecikir.
   */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedAccess: string | null =
      window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh: string | null =
      window.localStorage.getItem(REFRESH_TOKEN_KEY);

    if (storedRefresh === null) {
      setTokenState(storedAccess);
      setRefreshTokenState(null);
      setIsReady(true);
      return;
    }

    let cancelled = false;

    void (async (): Promise<void> => {
      try {
        const result = await authApi.refresh({
          refreshToken: storedRefresh,
        });
        if (cancelled) {
          return;
        }
        window.localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
        window.localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
        setTokenState(result.accessToken);
        setRefreshTokenState(result.refreshToken);
      } catch {
        if (cancelled) {
          return;
        }
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        setTokenState(null);
        setRefreshTokenState(null);
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setSession = useCallback((session: AuthSessionPayload) => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    setTokenState(session.accessToken);
    setRefreshTokenState(session.refreshToken);
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    setTokenState(null);
    setRefreshTokenState(null);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      refreshToken,
      isReady,
      setSession,
      clearSession,
      logout,
    }),
    [token, refreshToken, isReady, setSession, clearSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth yalnızca AuthProvider içinde kullanılmalıdır');
  }
  return ctx;
}
