'use client';

import {
  defaultLocale,
  getMessages,
  LOCALE_STORAGE_KEY,
  type Locale,
  locales,
} from '@/i18n';
import type { MessageKey } from '@/i18n';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }
  const raw: string | null = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (raw === 'en' || raw === 'tr') {
    return raw;
  }
  return defaultLocale;
}

export function LocaleProvider({ children }: { children: ReactNode }): ReactNode {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    document.documentElement.lang = locale === 'tr' ? 'tr' : 'en';
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale, isReady]);

  const setLocale = useCallback((next: Locale) => {
    if (!locales.includes(next)) {
      return;
    }
    setLocaleState(next);
  }, []);

  const table = useMemo(() => getMessages(locale), [locale]);

  const t = useCallback(
    (key: MessageKey): string => {
      const value: string | undefined = table[key];
      return value ?? key;
    },
    [table],
  );

  const value = useMemo(
    (): LocaleContextValue => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (ctx === null) {
    throw new Error('useLocaleContext yalnızca LocaleProvider içinde kullanılmalıdır');
  }
  return ctx;
}
