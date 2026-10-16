'use client';

import { preferencesApi, type PreferencesDto } from '@/api/preferences/preferencesApi';
import { useAuth } from '@/components/providers/auth-provider';
import { useLocaleContext } from '@/components/providers/locale-provider';
import { useTheme } from '@/components/providers/theme-provider';
import { isLocale, type Locale } from '@/i18n';
import {
  applyPalette,
  BUILT_IN_THEME_KEYS,
  CUSTOM_THEME_KEYS,
  FONT_SCALES,
  modeForThemeKey,
  resolvePalette,
  type CustomThemeKey,
  type CustomThemes,
  type FontScale,
  type Palette,
  type ThemeKey,
} from '@/lib/appearance/palettes';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const APPEARANCE_STORAGE_KEY = 'devatlas_appearance';

interface AppearanceCache {
  themeKey: ThemeKey;
  fontScale: FontScale;
  customThemes: CustomThemes;
}

export interface AppearanceContextValue {
  themeKey: ThemeKey;
  fontScale: FontScale;
  customThemes: CustomThemes;
  palette: Palette;
  selectTheme: (key: ThemeKey) => void;
  saveCustomTheme: (key: CustomThemeKey, name: string, palette: Palette) => void;
  deleteCustomTheme: (key: CustomThemeKey) => void;
  setFontScale: (scale: FontScale) => void;
  setLocalePreference: (locale: Locale) => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

const DEFAULT_CACHE: AppearanceCache = {
  themeKey: 'light-default',
  fontScale: 'normal',
  customThemes: {},
};

function isThemeKey(value: unknown): value is ThemeKey {
  return (
    typeof value === 'string' &&
    ((BUILT_IN_THEME_KEYS as readonly string[]).includes(value) ||
      (CUSTOM_THEME_KEYS as readonly string[]).includes(value))
  );
}

function isFontScale(value: unknown): value is FontScale {
  return typeof value === 'string' && (FONT_SCALES as readonly string[]).includes(value);
}

function readCache(): AppearanceCache {
  try {
    const raw: string | null = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (raw === null) {
      return DEFAULT_CACHE;
    }
    const parsed = JSON.parse(raw) as Partial<AppearanceCache>;
    return {
      themeKey: isThemeKey(parsed.themeKey) ? parsed.themeKey : DEFAULT_CACHE.themeKey,
      fontScale: isFontScale(parsed.fontScale) ? parsed.fontScale : DEFAULT_CACHE.fontScale,
      customThemes: parsed.customThemes ?? {},
    };
  } catch {
    return DEFAULT_CACHE;
  }
}

function writeCache(cache: AppearanceCache): void {
  try {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Depolama kullanılamıyorsa tercih yalnızca bellekte tutulur.
  }
}

export function AppearanceProvider({ children }: { children: ReactNode }): ReactNode {
  const { token, isReady } = useAuth();
  const { setLocale } = useLocaleContext();
  const { setTheme } = useTheme();

  const [themeKey, setThemeKey] = useState<ThemeKey>(DEFAULT_CACHE.themeKey);
  const [fontScale, setFontScaleState] = useState<FontScale>(DEFAULT_CACHE.fontScale);
  const [customThemes, setCustomThemes] = useState<CustomThemes>({});
  const [loaded, setLoaded] = useState<boolean>(false);

  /** Sunucuya gönderilen son tercihleri takip eder; oturum yoksa yalnızca yerelde saklanır. */
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  // Yerel önbellekten başla, sonra oturum varsa sunucudaki tercihleri uygula.
  useEffect(() => {
    const cache: AppearanceCache = readCache();
    setThemeKey(cache.themeKey);
    setFontScaleState(cache.fontScale);
    setCustomThemes(cache.customThemes);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!isReady || token === null) {
      return;
    }
    let cancelled = false;
    void (async (): Promise<void> => {
      try {
        const prefs: PreferencesDto = await preferencesApi.get(token);
        if (cancelled) {
          return;
        }
        setThemeKey(prefs.themeKey);
        setFontScaleState(prefs.fontScale);
        setCustomThemes(prefs.customThemes ?? {});
        if (isLocale(prefs.locale)) {
          setLocale(prefs.locale);
        }
      } catch {
        // Tercihler alınamazsa yerel değerler kullanılmaya devam eder.
      }
    })();
    return () => {
      cancelled = true;
    };
    // Yalnızca oturum değiştiğinde çalışır; setLocale kararlıdır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, token]);

  const palette: Palette = useMemo(
    () => resolvePalette(themeKey, customThemes),
    [themeKey, customThemes],
  );

  // Paleti belgeye uygula ve açık/koyu modu tema sağlayıcısına bildir.
  useEffect(() => {
    if (!loaded) {
      return;
    }
    applyPalette(palette, fontScale);
    setTheme(modeForThemeKey(themeKey));
    writeCache({ themeKey, fontScale, customThemes });
  }, [loaded, palette, fontScale, themeKey, customThemes, setTheme]);

  const pushServer = useCallback((body: Parameters<typeof preferencesApi.update>[1]): void => {
    const current: string | null = tokenRef.current;
    if (current === null) {
      return;
    }
    void preferencesApi.update(current, body).catch(() => {
      // Sunucuya yazılamazsa yerel tercih korunur ve bir sonraki açılışta eşitlenir.
    });
  }, []);

  const selectTheme = useCallback(
    (key: ThemeKey): void => {
      setThemeKey(key);
      pushServer({ themeKey: key });
    },
    [pushServer],
  );

  const saveCustomTheme = useCallback(
    (key: CustomThemeKey, name: string, nextPalette: Palette): void => {
      const slot = { name: name.trim(), palette: nextPalette };
      const next: CustomThemes = { ...customThemes, [key]: slot };
      setCustomThemes(next);
      setThemeKey(key);
      pushServer({ customThemes: next, themeKey: key });
    },
    [customThemes, pushServer],
  );

  const deleteCustomTheme = useCallback(
    (key: CustomThemeKey): void => {
      const next: CustomThemes = { ...customThemes };
      delete next[key];
      const nextKey: ThemeKey = themeKey === key ? 'light-default' : themeKey;
      setCustomThemes(next);
      setThemeKey(nextKey);
      pushServer({ customThemes: next, themeKey: nextKey });
    },
    [customThemes, pushServer, themeKey],
  );

  const setFontScale = useCallback(
    (scale: FontScale): void => {
      setFontScaleState(scale);
      pushServer({ fontScale: scale });
    },
    [pushServer],
  );

  const setLocalePreference = useCallback(
    (locale: Locale): void => {
      setLocale(locale);
      pushServer({ locale });
    },
    [pushServer, setLocale],
  );

  const value = useMemo(
    (): AppearanceContextValue => ({
      themeKey,
      fontScale,
      customThemes,
      palette,
      selectTheme,
      saveCustomTheme,
      deleteCustomTheme,
      setFontScale,
      setLocalePreference,
    }),
    [
      themeKey,
      fontScale,
      customThemes,
      palette,
      selectTheme,
      saveCustomTheme,
      deleteCustomTheme,
      setFontScale,
      setLocalePreference,
    ],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  const ctx = useContext(AppearanceContext);
  if (ctx === null) {
    throw new Error('useAppearance yalnızca AppearanceProvider içinde kullanılmalıdır');
  }
  return ctx;
}
