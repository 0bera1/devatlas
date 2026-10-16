import { enMessages } from './en';
import { arMessages } from './locales/ar';
import { bnMessages } from './locales/bn';
import { esMessages } from './locales/es';
import { frMessages } from './locales/fr';
import { hiMessages } from './locales/hi';
import { ptMessages } from './locales/pt';
import { ruMessages } from './locales/ru';
import { urMessages } from './locales/ur';
import { zhMessages } from './locales/zh';
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

const messageTables: Record<Locale, Record<MessageKey, string>> = {
  tr: trMessages,
  en: enMessages,
  zh: zhMessages,
  hi: hiMessages,
  es: esMessages,
  ar: arMessages,
  fr: frMessages,
  bn: bnMessages,
  pt: ptMessages,
  ru: ruMessages,
  ur: urMessages,
};

export function getMessages(locale: Locale): Record<MessageKey, string> {
  return messageTables[locale] ?? enMessages;
}
