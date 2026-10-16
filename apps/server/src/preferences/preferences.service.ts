import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { PRISMA_SERVICE, type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import {
  CUSTOM_THEME_KEYS,
  DEFAULT_PREFERENCES,
  FONT_SCALES,
  HEX_COLOR_PATTERN,
  LOCALES,
  PALETTE_FIELDS,
  THEME_KEYS,
  type CustomThemeKey,
  type CustomThemePalette,
  type FontScale,
  type Locale,
  type ThemeKey,
} from './preferences.constants';

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_URL_PREFIX = '/uploads/avatars';

export interface PreferencesView {
  locale: Locale;
  themeKey: ThemeKey;
  fontScale: FontScale;
  customThemes: Partial<Record<CustomThemeKey, CustomThemePalette>>;
}

export interface UpdatePreferencesInput {
  locale?: string;
  themeKey?: string;
  fontScale?: string;
  customThemes?: unknown;
}

/** Dosyanın gerçek türünü içeriğinden (sihirli baytlar) doğrular. */
export function detectImageExtension(buffer: Buffer): 'png' | 'jpg' | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
  return null;
}

@Injectable()
export class PreferencesService {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
    private readonly configService: ConfigService,
  ) {}

  public async get(userId: string): Promise<PreferencesView> {
    const row = await this.prisma.userPreference.findUnique({ where: { userId } });
    return this.toView(row);
  }

  public async update(userId: string, input: UpdatePreferencesInput): Promise<PreferencesView> {
    const current = await this.prisma.userPreference.findUnique({ where: { userId } });
    const base = this.toView(current);

    const locale: Locale = input.locale === undefined ? base.locale : this.parseLocale(input.locale);
    const fontScale: FontScale =
      input.fontScale === undefined ? base.fontScale : this.parseFontScale(input.fontScale);
    const themeKey: ThemeKey =
      input.themeKey === undefined ? base.themeKey : this.parseThemeKey(input.themeKey);
    const customThemes =
      input.customThemes === undefined
        ? base.customThemes
        : this.parseCustomThemes(input.customThemes);

    if (
      (CUSTOM_THEME_KEYS as readonly string[]).includes(themeKey) &&
      customThemes[themeKey as CustomThemeKey] === undefined
    ) {
      throw new BadRequestException('Seçilen özel tema kaydedilmemiş');
    }

    const data = {
      locale,
      themeKey,
      fontScale,
      customThemes: customThemes as object,
    };
    const row = await this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return this.toView(row);
  }

  public async setAvatar(userId: string, buffer: Buffer): Promise<{ avatarUrl: string }> {
    const extension = detectImageExtension(buffer);
    if (extension === null) {
      throw new BadRequestException('Yalnızca PNG veya JPG yüklenebilir');
    }
    if (buffer.length > AVATAR_MAX_BYTES) {
      throw new BadRequestException('Dosya 5 MB sınırını aşıyor');
    }

    const dir: string = this.avatarDir();
    await mkdir(dir, { recursive: true });

    const fileName = `${userId}-${randomBytes(8).toString('hex')}.${extension}`;
    await writeFile(join(dir, fileName), buffer);

    const previous = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    const avatarUrl = `${AVATAR_URL_PREFIX}/${fileName}`;
    await this.prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
    await this.removeFile(previous?.avatarUrl ?? null);

    return { avatarUrl };
  }

  public async removeAvatar(userId: string): Promise<void> {
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });
    await this.prisma.user.update({ where: { id: userId }, data: { avatarUrl: null } });
    await this.removeFile(current?.avatarUrl ?? null);
  }

  private toView(
    row: { locale: string; themeKey: string; fontScale: string; customThemes: unknown } | null,
  ): PreferencesView {
    if (row === null) {
      return { ...DEFAULT_PREFERENCES, customThemes: {} };
    }
    return {
      locale: this.isOneOf(LOCALES, row.locale) ? row.locale : DEFAULT_PREFERENCES.locale,
      themeKey: this.isOneOf(THEME_KEYS, row.themeKey) ? row.themeKey : DEFAULT_PREFERENCES.themeKey,
      fontScale: this.isOneOf(FONT_SCALES, row.fontScale) ? row.fontScale : DEFAULT_PREFERENCES.fontScale,
      customThemes: (row.customThemes as PreferencesView['customThemes'] | null) ?? {},
    };
  }

  private parseLocale(value: string): Locale {
    if (!this.isOneOf(LOCALES, value)) {
      throw new BadRequestException('Desteklenmeyen dil');
    }
    return value;
  }

  private parseFontScale(value: string): FontScale {
    if (!this.isOneOf(FONT_SCALES, value)) {
      throw new BadRequestException('Geçersiz yazı boyutu');
    }
    return value;
  }

  private parseThemeKey(value: string): ThemeKey {
    if (!this.isOneOf(THEME_KEYS, value)) {
      throw new BadRequestException('Geçersiz tema');
    }
    return value;
  }

  private parseCustomThemes(
    value: unknown,
  ): Partial<Record<CustomThemeKey, CustomThemePalette>> {
    if (value === null) {
      return {};
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException('Özel temalar geçersiz');
    }

    const result: Partial<Record<CustomThemeKey, CustomThemePalette>> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (!this.isOneOf(CUSTOM_THEME_KEYS, key)) {
        throw new BadRequestException(`Bilinmeyen özel tema: ${key}`);
      }
      result[key] = this.parseCustomPalette(entry);
    }
    return result;
  }

  private parseCustomPalette(entry: unknown): CustomThemePalette {
    if (typeof entry !== 'object' || entry === null) {
      throw new BadRequestException('Özel tema biçimi geçersiz');
    }
    const { name, palette } = entry as { name?: unknown; palette?: unknown };
    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 40) {
      throw new BadRequestException('Tema adı 1-40 karakter olmalı');
    }
    if (typeof palette !== 'object' || palette === null) {
      throw new BadRequestException('Tema renkleri eksik');
    }

    const colors = {} as Record<(typeof PALETTE_FIELDS)[number], string>;
    for (const field of PALETTE_FIELDS) {
      const color = (palette as Record<string, unknown>)[field];
      if (typeof color !== 'string' || !HEX_COLOR_PATTERN.test(color)) {
        throw new BadRequestException(`Geçersiz renk: ${field}`);
      }
      colors[field] = color.toLowerCase();
    }
    return { name: name.trim(), palette: colors };
  }

  private isOneOf<T extends string>(list: readonly T[], value: string): value is T {
    return (list as readonly string[]).includes(value);
  }

  private avatarDir(): string {
    const root: string = this.configService.get<string>('UPLOAD_DIR') ?? join(process.cwd(), 'uploads');
    return join(root, 'avatars');
  }

  private async removeFile(avatarUrl: string | null): Promise<void> {
    if (avatarUrl === null || !avatarUrl.startsWith(`${AVATAR_URL_PREFIX}/`)) {
      return;
    }
    const fileName = avatarUrl.slice(AVATAR_URL_PREFIX.length + 1);
    try {
      await unlink(join(this.avatarDir(), fileName));
    } catch {
      // Dosya zaten yoksa sorun değil.
    }
  }
}
