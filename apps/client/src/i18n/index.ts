import { enMessages } from './en';
import { trMessages, type MessageKey } from './tr';

export type { MessageKey };
export type Locale = 'tr' | 'en';

export const locales: Locale[] = ['tr', 'en'];
export const defaultLocale: Locale = 'tr';

export const LOCALE_STORAGE_KEY = 'devatlas_locale';
export const THEME_STORAGE_KEY = 'devatlas_theme';

export function getMessages(locale: Locale): Record<MessageKey, string> {
  return (locale === 'tr' ? trMessages : enMessages) as Record<MessageKey, string>;
}
