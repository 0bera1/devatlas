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

export interface AuthContextValue {
  token: string | null;
  isReady: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setTokenState(window.localStorage.getItem(ACCESS_TOKEN_KEY));
    setIsReady(true);
  }, []);

  const setToken = useCallback((value: string | null) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (value === null) {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    } else {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, value);
    }
    setTokenState(value);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isReady,
      setToken,
      logout,
    }),
    [token, isReady, setToken, logout],
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
