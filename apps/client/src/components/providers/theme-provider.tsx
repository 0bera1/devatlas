'use client';

import { THEME_STORAGE_KEY } from '@/i18n';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  resolvedDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system';
  }
  const raw: string | null = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (raw === 'light' || raw === 'dark' || raw === 'system') {
    return raw;
  }
  return 'system';
}

export function applyThemeToDocument(mode: ThemeMode): boolean {
  const root: HTMLElement = document.documentElement;
  let dark: boolean;
  switch (mode) {
    case 'dark':
      dark = true;
      break;
    case 'light':
      dark = false;
      break;
    default:
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      break;
  }
  root.classList.toggle('dark', dark);
  return dark;
}

export function ThemeProvider({ children }: { children: ReactNode }): ReactNode {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [resolvedDark, setResolvedDark] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const stored: ThemeMode = readStoredTheme();
    setThemeState(stored);
    setResolvedDark(applyThemeToDocument(stored));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    setResolvedDark(applyThemeToDocument(theme));
  }, [theme, isReady]);

  useEffect(() => {
    if (!isReady || theme !== 'system') {
      return;
    }
    const media: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (): void => {
      setResolvedDark(applyThemeToDocument('system'));
    };
    media.addEventListener('change', onChange);
    return () => {
      media.removeEventListener('change', onChange);
    };
  }, [theme, isReady]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const value = useMemo(
    (): ThemeContextValue => ({
      theme,
      setTheme,
      resolvedDark,
    }),
    [theme, setTheme, resolvedDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme yalnızca ThemeProvider içinde kullanılmalıdır');
  }
  return ctx;
}
