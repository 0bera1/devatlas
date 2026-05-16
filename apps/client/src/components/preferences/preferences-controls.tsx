'use client';

import { useTheme } from '@/components/providers/theme-provider';
import type { ThemeMode } from '@/components/providers/theme-provider';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { Locale } from '@/i18n';
import { locales } from '@/i18n';
import type { MessageKey } from '@/i18n';
import type { ReactNode } from 'react';

interface PreferencesControlsProps {
  readonly compact?: boolean;
  readonly variant?: 'default' | 'auth';
}

const LOCALE_LABEL_KEYS: Record<Locale, MessageKey> = {
  tr: 'preferences.localeTr',
  en: 'preferences.localeEn',
};

const pressEase =
  'transition-[color,opacity] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none';

const gliderEase =
  'transition-transform duration-300 ease-[cubic-bezier(0.34,1.25,0.64,1)] motion-reduce:transition-none will-change-transform';

export function PreferencesControls(
  props: PreferencesControlsProps,
): ReactNode {
  const { compact, variant = 'default' } = props;
  const { t, locale, setLocale } = useTranslations();
  const { theme, setTheme } = useTheme();

  const isAuth: boolean = variant === 'auth';
  const isCompact: boolean = compact === true;

  const shell: string = isAuth
    ? `inline-flex max-w-full flex-wrap items-center rounded-full border border-white/15 bg-white/[0] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md ${
        isCompact ? 'gap-0.5 px-1 py-0.5' : 'gap-1 px-1.5 py-1'
      }`
    : `inline-flex max-w-full flex-wrap items-center rounded-full border border-zinc-200/90 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-sm dark:border-zinc-600/80 dark:bg-zinc-900/50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
        isCompact ? 'gap-0.5 px-0.5 py-0.5 sm:px-1' : 'gap-1 px-1 py-1'
      }`;

  const divider: string = isAuth
    ? 'mx-0.5 hidden h-4 w-px shrink-0 bg-white/15 sm:block'
    : 'mx-0.5 hidden h-4 w-px shrink-0 bg-zinc-200/80 sm:block dark:bg-zinc-600/70';

  const localeIndex: number = localeIndexFromCode(locale);

  return (
    <div className={shell}>
      <div
        role="radiogroup"
        aria-label={t('preferences.language')}
        className="min-w-0 shrink-0 rounded-xl bg-zinc-950/[0.04] p-0.5 dark:bg-white/[0]"
      >
        <div className="relative flex min-w-0 overflow-hidden rounded-lg">
          <SlidingGlider
            segmentCount={locales.length}
            activeIndex={localeIndex}
            isAuth={isAuth}
          />
          {locales.map((code: Locale) => {
            const selected: boolean = locale === code;
            const label: string = isCompact
              ? code.toUpperCase()
              : t(LOCALE_LABEL_KEYS[code]);
            return (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={selected}
                className={localeButtonClass(isAuth, isCompact, selected)}
                onClick={() => {
                  setLocale(code);
                }}
              >
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <span className={divider} aria-hidden />

      <div
        role="radiogroup"
        aria-label={t('preferences.theme')}
        className="min-w-0 shrink-0 rounded-xl bg-zinc-950/[0.04] p-0.5 dark:bg-white/[0]"
      >
        <div className="relative flex min-w-0 overflow-hidden rounded-lg">
          <SlidingGlider
            segmentCount={3}
            activeIndex={themeModeIndex(theme)}
            isAuth={isAuth}
          />
          <ThemeModeButton
            isAuth={isAuth}
            isCompact={isCompact}
            labelKey="preferences.themeLight"
            selected={theme === 'light'}
            onSelect={() => {
              setTheme('light');
            }}
            t={t}
            icon={<IconSun />}
          />
          <ThemeModeButton
            isAuth={isAuth}
            isCompact={isCompact}
            labelKey="preferences.themeDark"
            selected={theme === 'dark'}
            onSelect={() => {
              setTheme('dark');
            }}
            t={t}
            icon={<IconMoon />}
          />
          <ThemeModeButton
            isAuth={isAuth}
            isCompact={isCompact}
            labelKey="preferences.themeSystem"
            selected={theme === 'system'}
            onSelect={() => {
              setTheme('system');
            }}
            t={t}
            icon={<IconSystem />}
          />
        </div>
      </div>
    </div>
  );
}

function localeIndexFromCode(code: Locale): number {
  const index: number = locales.indexOf(code);
  return index < 0 ? 0 : index;
}

function themeModeIndex(mode: ThemeMode): number {
  switch (mode) {
    case 'light':
      return 0;
    case 'dark':
      return 1;
    case 'system':
      return 2;
    default:
      return 2;
  }
}

interface SlidingGliderProps {
  readonly segmentCount: number;
  readonly activeIndex: number;
  readonly isAuth: boolean;
}

function SlidingGlider(props: SlidingGliderProps): ReactNode {
  const { segmentCount, activeIndex, isAuth } = props;
  const safeCount: number = segmentCount < 1 ? 1 : segmentCount;
  const safeIndex: number = Math.min(
    Math.max(0, activeIndex),
    safeCount - 1,
  );
  const widthPct: number = 100 / safeCount;

  const surface: string = isAuth
    ? `pointer-events-none absolute inset-y-0 left-0 rounded-lg bg-amber-400/22 shadow-[0_0_0_1px_rgba(251,191,36,0.28)] ${gliderEase}`
    : `pointer-events-none absolute inset-y-0 left-0 rounded-lg bg-white/95 shadow-sm dark:bg-zinc-600/95 dark:shadow-md ${gliderEase}`;

  return (
    <span
      aria-hidden
      className={surface}
      style={{
        width: `${widthPct}%`,
        transform: `translateX(${safeIndex * 100}%)`,
      }}
    />
  );
}

function localeButtonClass(
  isAuth: boolean,
  isCompact: boolean,
  selected: boolean,
): string {
  const pad: string = isCompact
    ? 'min-w-0 flex-1 px-2 py-1 text-[11px] sm:px-2.5 sm:py-1.5 sm:text-xs'
    : 'min-w-0 flex-1 px-3 py-1.5 text-xs sm:text-[13px]';
  const base: string = `relative z-10 rounded-lg font-medium tabular-nums tracking-tight ${pad} ${pressEase} focus-visible:outline-none focus-visible:ring-2`;

  if (isAuth) {
    return selected
      ? `${base} text-amber-50 focus-visible:ring-amber-400/60`
      : `${base} text-zinc-400 hover:text-zinc-200 focus-visible:ring-amber-400/45`;
  }

  return selected
    ? `${base} text-violet-800 focus-visible:ring-violet-400/55 dark:text-violet-100`
    : `${base} text-zinc-600 hover:text-zinc-900 focus-visible:ring-violet-400/50 dark:text-zinc-400 dark:hover:text-zinc-100`;
}

interface ThemeModeButtonProps {
  readonly isAuth: boolean;
  readonly isCompact: boolean;
  readonly labelKey: MessageKey;
  readonly selected: boolean;
  readonly onSelect: () => void;
  readonly t: (key: MessageKey) => string;
  readonly icon: ReactNode;
}

function ThemeModeButton(props: ThemeModeButtonProps): ReactNode {
  const { isAuth, isCompact, labelKey, selected, onSelect, t, icon } = props;

  const size: string = isCompact
    ? 'min-h-7 min-w-0 flex-1 sm:min-h-8'
    : 'min-h-8 min-w-0 flex-1 sm:min-h-9';
  const iconBox: string = isCompact ? 'h-3.5 w-9' : 'h-4 w-8';

  const base: string = `relative z-10 inline-flex ${size} items-center justify-center rounded-lg ${pressEase} focus-visible:outline-none focus-visible:ring-2`;

  const className: string = (() => {
    if (isAuth) {
      return selected
        ? `${base} text-amber-50 focus-visible:ring-amber-400/55`
        : `${base} text-zinc-400 hover:text-zinc-200 focus-visible:ring-amber-400/45`;
    }
    return selected
      ? `${base} text-violet-800 focus-visible:ring-violet-400/55 dark:text-violet-100`
      : `${base} text-zinc-500 hover:text-zinc-800 focus-visible:ring-violet-400/50 dark:text-zinc-400 dark:hover:text-zinc-100`;
  })();

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      title={t(labelKey)}
      aria-label={t(labelKey)}
      className={className}
      onClick={onSelect}
    >
      <span
        className={`flex ${iconBox} items-center justify-center [&>svg]:h-full [&>svg]:w-full`}
      >
        {icon}
      </span>
    </button>
  );
}

function IconSun(): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon(): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconSystem(): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
