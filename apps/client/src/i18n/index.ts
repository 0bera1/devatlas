import { enMessages } from './en';
import { trMessages, type MessageKey } from './tr';

export type { MessageKey };

/**
 * Desteklenen diller: Türkçe ve en popüler on dil.
 * Çevirisi henüz yapılmamış diller İngilizce metinle gösterilir.
 */
export type Locale =
  | 'tr'
  | 'en'
  | 'zh'
  | 'hi'
  | 'es'
  | 'ar'
  | 'fr'
  | 'bn'
  | 'pt'
  | 'ru'
  | 'ur';

export const locales: Locale[] = [
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
];

/** Dil seçicide gösterilen yerel adlar. */
export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  zh: '中文 (普通话)',
  hi: 'हिन्दी',
  es: 'Español',
  ar: 'العربية',
  fr: 'Français',
  bn: 'বাংলা',
  pt: 'Português',
  ru: 'Русский',
  ur: 'اردو',
};

/** Sağdan sola yazılan diller. */
export const rtlLocales: readonly Locale[] = ['ar', 'ur'];

export const defaultLocale: Locale = 'tr';

export const LOCALE_STORAGE_KEY = 'devatlas_locale';
export const THEME_STORAGE_KEY = 'devatlas_theme';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as string[]).includes(value);
}

export function getMessages(locale: Locale): Record<MessageKey, string> {
  if (locale === 'tr') {
    return trMessages as Record<MessageKey, string>;
  }
  // Çevirisi olmayan diller için İngilizce metin kullanılır.
  return enMessages as Record<MessageKey, string>;
}
