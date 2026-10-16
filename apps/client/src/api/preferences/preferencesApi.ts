import { apiClient } from '@/api/http/api-client';
import { getApiBaseUrl } from '@/lib/api/base-url';
import type { Locale } from '@/i18n';
import type { CustomThemes, FontScale, ThemeKey } from '@/lib/appearance/palettes';

export interface PreferencesDto {
  locale: Locale;
  themeKey: ThemeKey;
  fontScale: FontScale;
  customThemes: CustomThemes;
}

export interface UpdatePreferencesBody {
  locale?: Locale;
  themeKey?: ThemeKey;
  fontScale?: FontScale;
  customThemes?: CustomThemes;
}

export const preferencesApi = {
  async get(accessToken: string): Promise<PreferencesDto> {
    const response = await apiClient.get<PreferencesDto>('/profile/preferences', {
      accessToken,
    });
    return response.data;
  },

  async update(accessToken: string, body: UpdatePreferencesBody): Promise<PreferencesDto> {
    const response = await apiClient.patch<PreferencesDto>('/profile/preferences', {
      accessToken,
      body,
    });
    return response.data;
  },

  /** Profil fotoğrafını yükler. Çok parçalı (multipart) gönderim için ham fetch kullanılır. */
  async uploadAvatar(accessToken: string, file: File): Promise<{ avatarUrl: string }> {
    const form = new FormData();
    form.append('file', file);

    const response = await fetch(`${getApiBaseUrl()}/profile/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
      const message: string = Array.isArray(payload?.message)
        ? payload.message.join(', ')
        : (payload?.message ?? 'Fotoğraf yüklenemedi');
      throw new Error(message);
    }
    return (await response.json()) as { avatarUrl: string };
  },

  async removeAvatar(accessToken: string): Promise<void> {
    await apiClient.delete<void>('/profile/avatar', { accessToken });
  },
};

/** Sunucudan gelen avatar yolunu tam adrese çevirir. */
export function resolveAvatarUrl(avatarUrl: string | null | undefined): string | null {
  if (avatarUrl === null || avatarUrl === undefined || avatarUrl.length === 0) {
    return null;
  }
  return `${getApiBaseUrl()}${avatarUrl}`;
}
