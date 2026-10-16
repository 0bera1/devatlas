/** Desteklenen arayüz dilleri: Türkçe ve en popüler on dil. */
export const LOCALES = [
  'tr',
  'en',
  'zh',
  'hi',
  'es',
  'ar',
  'fr',
  'bn',
  'pt',
  'ru',
  'ur',
] as const;
export type Locale = (typeof LOCALES)[number];

/** Hazır temalar: açık iki, koyu iki. */
export const BUILT_IN_THEME_KEYS = [
  'light-default',
  'light-warm',
  'dark-default',
  'dark-night',
] as const;

/** Kullanıcının kaydedebileceği özel temalar: açık ikisi, koyu ikisi. */
export const CUSTOM_THEME_KEYS = [
  'custom-light-1',
  'custom-light-2',
  'custom-dark-1',
  'custom-dark-2',
] as const;
export type CustomThemeKey = (typeof CUSTOM_THEME_KEYS)[number];

export const THEME_KEYS = [...BUILT_IN_THEME_KEYS, ...CUSTOM_THEME_KEYS] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];

/** Yazı boyutu seçenekleri (dört adet). */
export const FONT_SCALES = ['small', 'normal', 'large', 'xlarge'] as const;
export type FontScale = (typeof FONT_SCALES)[number];

export const PALETTE_FIELDS = [
  'background',
  'surface',
  'text',
  'muted',
  'accent',
  'border',
] as const;
export type PaletteField = (typeof PALETTE_FIELDS)[number];

export interface CustomThemePalette {
  name: string;
  palette: Record<PaletteField, string>;
}

export const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const DEFAULT_PREFERENCES = {
  locale: 'tr' as Locale,
  themeKey: 'light-default' as ThemeKey,
  fontScale: 'normal' as FontScale,
};
