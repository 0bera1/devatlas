'use client';

import { useLocaleContext } from '@/components/providers/locale-provider';
import type { MessageKey } from '@/i18n';

export function useTranslations(): {
  t: (key: MessageKey) => string;
  locale: ReturnType<typeof useLocaleContext>['locale'];
  setLocale: ReturnType<typeof useLocaleContext>['setLocale'];
} {
  const { t, locale, setLocale } = useLocaleContext();
  return { t, locale, setLocale };
}
