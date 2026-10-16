export type PaletteField =
  | 'background'
  | 'surface'
  | 'text'
  | 'muted'
  | 'accent'
  | 'border';

export type Palette = Readonly<Record<PaletteField, string>>;

export type ThemeMode = 'light' | 'dark';

export const BUILT_IN_THEME_KEYS = [
  'light-default',
  'light-warm',
  'dark-default',
  'dark-night',
] as const;
export type BuiltInThemeKey = (typeof BUILT_IN_THEME_KEYS)[number];

export const CUSTOM_THEME_KEYS = [
  'custom-light-1',
  'custom-light-2',
  'custom-dark-1',
  'custom-dark-2',
] as const;
export type CustomThemeKey = (typeof CUSTOM_THEME_KEYS)[number];

export type ThemeKey = BuiltInThemeKey | CustomThemeKey;

export interface CustomThemeSlot {
  readonly name: string;
  readonly palette: Palette;
}

export type CustomThemes = Partial<Record<CustomThemeKey, CustomThemeSlot>>;

export const FONT_SCALES = ['small', 'normal', 'large', 'xlarge'] as const;
export type FontScale = (typeof FONT_SCALES)[number];

/** Kök yazı boyutu (px). Normal, uygulamanın mevcut görünümüne karşılık gelir. */
export const FONT_SCALE_PX: Record<FontScale, number> = {
  small: 14,
  normal: 16,
  large: 18,
  xlarge: 20,
};

export const BUILT_IN_PALETTES: Record<BuiltInThemeKey, { mode: ThemeMode; palette: Palette }> = {
  'light-default': {
    mode: 'light',
    palette: {
      background: '#FAFAF8',
      surface: '#FFFFFF',
      text: '#111111',
      muted: '#6E6E68',
      accent: '#E4572E',
      border: '#E5E5E0',
    },
  },
  'light-warm': {
    mode: 'light',
    palette: {
      background: '#F4EFE6',
      surface: '#FBF8F2',
      text: '#2B2118',
      muted: '#6B5E50',
      accent: '#B5532A',
      border: '#E2D9C8',
    },
  },
  'dark-default': {
    mode: 'dark',
    palette: {
      background: '#121316',
      surface: '#1B1D22',
      text: '#ECEDEF',
      muted: '#9AA0AA',
      accent: '#FF7A4D',
      border: '#2A2D35',
    },
  },
  'dark-night': {
    mode: 'dark',
    palette: {
      background: '#0B1220',
      surface: '#132033',
      text: '#E2E8F0',
      muted: '#94A3B8',
      accent: '#5EEAD4',
      border: '#1E2B40',
    },
  },
};

/** Kullanıcı temaları için başlangıç paleti (açık ya da koyu moda göre). */
export const CUSTOM_SEED_PALETTE: Record<ThemeMode, Palette> = {
  light: BUILT_IN_PALETTES['light-default'].palette,
  dark: BUILT_IN_PALETTES['dark-default'].palette,
};

export function isBuiltInThemeKey(value: string): value is BuiltInThemeKey {
  return (BUILT_IN_THEME_KEYS as readonly string[]).includes(value);
}

export function isCustomThemeKey(value: string): value is CustomThemeKey {
  return (CUSTOM_THEME_KEYS as readonly string[]).includes(value);
}

export function modeForThemeKey(key: ThemeKey): ThemeMode {
  if (isBuiltInThemeKey(key)) {
    return BUILT_IN_PALETTES[key].mode;
  }
  return key.startsWith('custom-dark') ? 'dark' : 'light';
}

/** Anahtara göre aktif paleti döndürür. Kayıtlı özel tema yoksa modun varsayılanı kullanılır. */
export function resolvePalette(key: ThemeKey, customThemes: CustomThemes): Palette {
  if (isBuiltInThemeKey(key)) {
    return BUILT_IN_PALETTES[key].palette;
  }
  return customThemes[key]?.palette ?? CUSTOM_SEED_PALETTE[modeForThemeKey(key)];
}

/**
 * Paleti kök elemana CSS değişkeni olarak yazar. Mevcut `--background` ve
 * `--foreground` değişkenleri de güncellenir, böylece gövde rengi tema ile değişir.
 */
export function applyPalette(palette: Palette, fontScale: FontScale): void {
  const root: HTMLElement = document.documentElement;
  root.style.setProperty('--background', palette.background);
  root.style.setProperty('--foreground', palette.text);
  root.style.setProperty('--surface', palette.surface);
  root.style.setProperty('--muted', palette.muted);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--border', palette.border);
  root.style.fontSize = `${FONT_SCALE_PX[fontScale]}px`;
}
