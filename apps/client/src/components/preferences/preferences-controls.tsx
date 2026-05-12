'use client';

import { useTranslations } from '@/hooks/use-translations';
import type { Locale } from '@/i18n';
import { locales } from '@/i18n';
import type { ThemeMode } from '@/components/providers/theme-provider';
import { useTheme } from '@/components/providers/theme-provider';
import type { ReactNode } from 'react';

interface PreferencesControlsProps {
  /** Daha sıkı spacing (header içi) */
  compact?: boolean;
  /** Giriş / kayıt tam ekranı: sadece dil, koyu panel stili */
  variant?: 'default' | 'auth';
}

export function PreferencesControls(
  props: PreferencesControlsProps,
): ReactNode {
  const { compact, variant = 'default' } = props;
  const { t, locale, setLocale } = useTranslations();
  const { theme, setTheme } = useTheme();

  const gap: string = compact ? 'gap-2' : 'gap-3';

  if (variant === 'auth') {
    return (
      <label className="flex items-center gap-2 text-xs font-medium text-zinc-300">
        <span className="sr-only">{t('preferences.language')}</span>
        <select
          value={locale}
          onChange={(e) => {
            setLocale(e.target.value as Locale);
          }}
          className="cursor-pointer rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white outline-none transition-colors hover:border-white/35 focus-visible:ring-2 focus-visible:ring-amber-400/80"
        >
          {locales.map((code: Locale) => (
            <option key={code} value={code} className="bg-zinc-900 text-white">
              {code.toUpperCase()}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center ${gap} rounded-xl border border-zinc-200 bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90`}
    >
      <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        <span className="sr-only">{t('preferences.language')}</span>
        <span aria-hidden className="hidden sm:inline">
          {t('preferences.language')}
        </span>
        <select
          value={locale}
          onChange={(e) => {
            setLocale(e.target.value as Locale);
          }}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        >
          {locales.map((code: Locale) => (
            <option key={code} value={code}>
              {code.toUpperCase()}
            </option>
          ))}
        </select>
      </label>
      <span className="hidden h-4 w-px bg-zinc-200 sm:block dark:bg-zinc-700" />
      <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        <span className="sr-only">{t('preferences.theme')}</span>
        <span aria-hidden className="hidden sm:inline">
          {t('preferences.theme')}
        </span>
        <select
          value={theme}
          onChange={(e) => {
            setTheme(e.target.value as ThemeMode);
          }}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        >
          <option value="light">{t('preferences.themeLight')}</option>
          <option value="dark">{t('preferences.themeDark')}</option>
          <option value="system">{t('preferences.themeSystem')}</option>
        </select>
      </label>
    </div>
  );
}
