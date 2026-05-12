'use client';

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setTokenState(window.localStorage.getItem(ACCESS_TOKEN_KEY));
    setRefreshTokenState(window.localStorage.getItem(REFRESH_TOKEN_KEY));
    setIsReady(true);
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
