'use client';

import { apiClient } from '@/api/http/api-client';
import { preferencesApi, resolveAvatarUrl } from '@/api/preferences/preferencesApi';
import { useAppearance } from '@/components/providers/appearance-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { useLocaleContext } from '@/components/providers/locale-provider';
import { useToast } from '@/components/providers/toast-provider';
import { useRequireAuth } from '@/hooks/auth/use-require-auth';
import { useTranslations } from '@/hooks/i18n/use-translations';
import {
  BUILT_IN_PALETTES,
  BUILT_IN_THEME_KEYS,
  CUSTOM_SEED_PALETTE,
  CUSTOM_THEME_KEYS,
  FONT_SCALE_PX,
  FONT_SCALES,
  modeForThemeKey,
  type CustomThemeKey,
  type FontScale,
  type Palette,
  type PaletteField,
} from '@/lib/appearance/palettes';
import { localeNames, locales, type Locale, type MessageKey } from '@/i18n';
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg'];
const PALETTE_FIELDS: readonly PaletteField[] = ['background', 'surface', 'text', 'muted', 'accent', 'border'];
const FONT_SCALE_LABEL: Record<FontScale, MessageKey> = {
  small: 'settings.fontScale.small',
  normal: 'settings.fontScale.normal',
  large: 'settings.fontScale.large',
  xlarge: 'settings.fontScale.xlarge',
};
const PALETTE_LABEL: Record<PaletteField, MessageKey> = {
  background: 'settings.color.background',
  surface: 'settings.color.surface',
  text: 'settings.color.text',
  muted: 'settings.color.muted',
  accent: 'settings.color.accent',
  border: 'settings.color.border',
};

const sectionClass = 'grid gap-6 border-t border-[var(--border)] py-8 md:grid-cols-[240px_minmax(0,1fr)]';
const panelClass = 'rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5';

export function SettingsView(): ReactNode {
  const { canRender } = useRequireAuth();
  if (!canRender) {
    return null;
  }
  return <SettingsContent />;
}

function SettingsContent(): ReactNode {
  const { t } = useTranslations();
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 text-[var(--foreground)] sm:px-6">
      <h1 className="font-serif text-4xl font-medium tracking-tight">{t('settings.title')}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{t('settings.subtitle')}</p>

      <AvatarSection />
      <LanguageSection />
      <ThemeSection />
      <FontScaleSection />
    </div>
  );
}

function SectionHeading(props: { title: MessageKey; hint?: MessageKey }): ReactNode {
  const { t } = useTranslations();
  return (
    <div>
      <h2 className="text-base font-semibold">{t(props.title)}</h2>
      {props.hint !== undefined ? <p className="mt-1 text-sm text-[var(--muted)]">{t(props.hint)}</p> : null}
    </div>
  );
}

function AvatarSection(): ReactNode {
  const { t } = useTranslations();
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(() => {
    if (token === null) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const response = await apiClient.get<{ avatarUrl?: string | null }>('/auth/profile', { accessToken: token });
        if (!cancelled) {
          setAvatarUrl(response.data.avatarUrl ?? null);
        }
      } catch {
        // Fotoğraf alınamazsa baş harfler gösterilir.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file: File | undefined = event.target.files?.[0];
    event.target.value = '';
    if (file === undefined || token === null) {
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > AVATAR_MAX_BYTES) {
      showError(t('settings.avatar.hint'));
      return;
    }
    setBusy(true);
    try {
      const result = await preferencesApi.uploadAvatar(token, file);
      setAvatarUrl(result.avatarUrl);
      showSuccess(t('settings.avatar.uploaded'));
    } catch (error) {
      showError(error instanceof Error ? error.message : t('settings.error'));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (): Promise<void> => {
    if (token === null) {
      return;
    }
    setBusy(true);
    try {
      await preferencesApi.removeAvatar(token);
      setAvatarUrl(null);
      showSuccess(t('settings.avatar.removed'));
    } catch {
      showError(t('settings.error'));
    } finally {
      setBusy(false);
    }
  };

  const src: string | null = resolveAvatarUrl(avatarUrl);

  return (
    <section className={sectionClass}>
      <SectionHeading title="settings.avatar.title" hint="settings.avatar.hint" />
      <div className={`${panelClass} flex items-center gap-5`}>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--background)] text-lg font-medium">
          {src !== null ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden>AD</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] disabled:opacity-60"
          >
            {t('settings.avatar.upload')}
          </button>
          {src !== null ? (
            <button
              type="button"
              disabled={busy}
              onClick={handleRemove}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {t('settings.avatar.remove')}
            </button>
          ) : null}
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFile} />
      </div>
    </section>
  );
}

function LanguageSection(): ReactNode {
  const { t, locale } = useTranslations();
  const { setLocalePreference } = useAppearance();
  return (
    <section className={sectionClass}>
      <SectionHeading title="settings.language.title" hint="settings.language.hint" />
      <div className={panelClass}>
        <label className="flex flex-col gap-2 text-sm font-medium">
          {t('settings.language.title')}
          <select
            value={locale}
            onChange={(event) => {
              const next = event.target.value;
              if ((locales as string[]).includes(next)) {
                setLocalePreference(next as Locale);
              }
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)]"
          >
            {locales.map((code) => (
              <option key={code} value={code}>
                {localeNames[code]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function ThemeSection(): ReactNode {
  const { t } = useTranslations();
  const { themeKey, customThemes, selectTheme, saveCustomTheme, deleteCustomTheme } = useAppearance();
  const { showSuccess, showError } = useToast();
  const [slot, setSlot] = useState<CustomThemeKey>('custom-light-1');
  const [draftName, setDraftName] = useState<string>('');
  const [draftPalette, setDraftPalette] = useState<Palette>(CUSTOM_SEED_PALETTE.light);

  // Seçili slot değiştiğinde taslağı kayıtlı temadan (ya da moda göre varsayılandan) yükle.
  useEffect(() => {
    const saved = customThemes[slot];
    setDraftName(saved?.name ?? '');
    setDraftPalette(saved?.palette ?? CUSTOM_SEED_PALETTE[modeForThemeKey(slot)]);
  }, [slot, customThemes]);

  const handleSave = (): void => {
    const name = draftName.trim();
    if (name.length === 0 || name.length > 40) {
      showError(t('settings.themes.name'));
      return;
    }
    saveCustomTheme(slot, name, draftPalette);
    showSuccess(t('settings.themes.saved'));
  };

  const handleDelete = (): void => {
    deleteCustomTheme(slot);
    showSuccess(t('settings.themes.deleted'));
  };

  return (
    <section className={sectionClass}>
      <SectionHeading title="settings.themes.title" />
      <div className="flex flex-col gap-8">
        <div>
          <h3 className="mb-3 text-sm font-medium text-[var(--muted)]">{t('settings.themes.presets')}</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {BUILT_IN_THEME_KEYS.map((key) => (
              <ThemeCard
                key={key}
                label={t(`settings.themes.preset.${key}` as MessageKey)}
                palette={BUILT_IN_PALETTES[key].palette}
                selected={themeKey === key}
                selectedLabel={t('settings.themes.selected')}
                onSelect={() => selectTheme(key)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-1 text-sm font-medium text-[var(--muted)]">{t('settings.themes.custom')}</h3>
          <p className="mb-3 text-xs text-[var(--muted)]">{t('settings.themes.customHint')}</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {CUSTOM_THEME_KEYS.map((key) => {
              const saved = customThemes[key];
              const palette: Palette = saved?.palette ?? CUSTOM_SEED_PALETTE[modeForThemeKey(key)];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSlot(key)}
                  className={`rounded-2xl text-left ${slot === key ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]' : ''}`}
                >
                  <ThemeCard
                    label={saved?.name ?? t(`settings.themes.slot.${key}` as MessageKey)}
                    palette={palette}
                    selected={themeKey === key}
                    selectedLabel={t('settings.themes.selected')}
                    emptyLabel={saved === undefined ? t('settings.themes.empty') : undefined}
                    onSelect={undefined}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className={`${panelClass} grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]`}>
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">{t('settings.themes.editor')}</h3>
            <label className="flex flex-col gap-1.5 text-sm">
              {t('settings.themes.name')}
              <input
                value={draftName}
                maxLength={40}
                onChange={(event) => setDraftName(event.target.value)}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PALETTE_FIELDS.map((field) => (
                <label key={field} className="flex items-center justify-between gap-3 text-sm">
                  {t(PALETTE_LABEL[field])}
                  <span className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draftPalette[field]}
                      onChange={(event) => setDraftPalette({ ...draftPalette, [field]: event.target.value })}
                      className="h-8 w-10 cursor-pointer rounded border border-[var(--border)] bg-transparent"
                      aria-label={t(PALETTE_LABEL[field])}
                    />
                    <span className="w-20 font-mono text-xs text-[var(--muted)]">{draftPalette[field]}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-[var(--foreground)] px-5 py-2 text-sm font-semibold text-[var(--background)]"
              >
                {t('settings.themes.save')}
              </button>
              <button
                type="button"
                onClick={() => selectTheme(slot)}
                disabled={customThemes[slot] === undefined}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
              >
                {t('settings.themes.select')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={customThemes[slot] === undefined}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-red-600 disabled:opacity-50"
              >
                {t('settings.themes.delete')}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-[var(--muted)]">{t('settings.themes.preview')}</p>
            <div
              className="rounded-2xl border p-4"
              style={{
                background: draftPalette.background,
                borderColor: draftPalette.border,
                color: draftPalette.text,
              }}
            >
              <div className="rounded-xl p-4" style={{ background: draftPalette.surface, border: `1px solid ${draftPalette.border}` }}>
                <p className="font-serif text-xl">{t('settings.themes.previewTitle')}</p>
                <p className="mt-2 text-sm" style={{ color: draftPalette.muted }}>
                  {t('settings.themes.previewBody')}
                </p>
                <span
                  className="mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
                  style={{ background: draftPalette.accent, color: draftPalette.surface }}
                >
                  {t('settings.themes.previewAction')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ThemeCardProps {
  label: string;
  palette: Palette;
  selected: boolean;
  selectedLabel: string;
  emptyLabel?: string;
  onSelect?: () => void;
}

function ThemeCard(props: ThemeCardProps): ReactNode {
  const { label, palette, selected, selectedLabel, emptyLabel, onSelect } = props;
  const body: ReactNode = (
    <>
      <div className="h-24 rounded-xl p-3" style={{ background: palette.background, border: `1px solid ${palette.border}` }}>
        <div className="h-2 w-3/5 rounded" style={{ background: palette.text }} />
        <div className="mt-2 h-1.5 w-4/5 rounded" style={{ background: palette.border }} />
        <div className="mt-2 h-1.5 w-2/3 rounded" style={{ background: palette.border }} />
        <div className="mt-auto h-2.5 w-8 rounded-full" style={{ background: palette.accent }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        {selected ? <span className="text-xs text-[var(--accent)]">{selectedLabel}</span> : null}
        {emptyLabel !== undefined ? <span className="text-xs text-[var(--muted)]">{emptyLabel}</span> : null}
      </div>
    </>
  );

  if (onSelect === undefined) {
    return <div className="w-full">{body}</div>;
  }
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left hover:border-[var(--accent)]"
    >
      {body}
    </button>
  );
}

function FontScaleSection(): ReactNode {
  const { t } = useTranslations();
  const { fontScale, setFontScale } = useAppearance();
  return (
    <section className={sectionClass}>
      <SectionHeading title="settings.fontScale.title" hint="settings.fontScale.hint" />
      <div className={`${panelClass} flex flex-col gap-5`}>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {FONT_SCALES.map((scale) => (
            <button
              key={scale}
              type="button"
              aria-pressed={fontScale === scale}
              onClick={() => setFontScale(scale)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${
                fontScale === scale
                  ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]'
                  : 'border-[var(--border)]'
              }`}
            >
              {t(FONT_SCALE_LABEL[scale])} <span className="text-xs opacity-70">{FONT_SCALE_PX[scale]}</span>
            </button>
          ))}
        </div>
        <p className="text-[var(--foreground)]" style={{ fontSize: `${FONT_SCALE_PX[fontScale]}px` }}>
          {t('settings.fontScale.sample')}
        </p>
      </div>
    </section>
  );
}
