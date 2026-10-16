import { BadRequestException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { detectImageExtension, PreferencesService } from './preferences.service';

function createService(stored: unknown = null) {
  const prisma = {
    userPreference: {
      findUnique: jest.fn().mockResolvedValue(stored),
      upsert: jest.fn(
        async ({ create, update }: { create: Record<string, unknown>; update: Record<string, unknown> }) => ({
          ...((stored as Record<string, unknown> | null) ?? {}),
          ...create,
          ...update,
        }),
      ),
    },
  };
  const config = { get: jest.fn() } as unknown as ConfigService;
  return {
    prisma,
    service: new PreferencesService(prisma as never, config),
  };
}

const VALID_PALETTE = {
  background: '#F7F9FC',
  surface: '#FFFFFF',
  text: '#14213D',
  muted: '#5B6478',
  accent: '#2F5BEA',
  border: '#DDE3EE',
};

describe('detectImageExtension', () => {
  it('PNG imzasını tanır', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(detectImageExtension(png)).toBe('png');
  });

  it('JPEG imzasını tanır', () => {
    expect(detectImageExtension(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpg');
  });

  it('görsel olmayan içeriği reddeder (uzantı ya da mime yanıltıcı olsa bile)', () => {
    expect(detectImageExtension(Buffer.from('<script>alert(1)</script>'))).toBeNull();
  });
});

describe('PreferencesService.update', () => {
  it('desteklenmeyen dili reddeder', async () => {
    const { service } = createService();
    await expect(service.update('u1', { locale: 'klingon' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('Türkçe ve listedeki diller kabul edilir', async () => {
    const { service } = createService();
    await expect(service.update('u1', { locale: 'tr' })).resolves.toMatchObject({ locale: 'tr' });
    await expect(service.update('u1', { locale: 'ar' })).resolves.toMatchObject({ locale: 'ar' });
  });

  it('kaydedilmemiş özel temaya geçiş reddedilir', async () => {
    const { service } = createService();
    await expect(
      service.update('u1', { themeKey: 'custom-dark-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('geçerli özel tema kaydedilir ve renkler küçük harfe çevrilir', async () => {
    const { service, prisma } = createService();

    await service.update('u1', {
      customThemes: {
        'custom-light-1': {
          name: '  Mavi kağıt  ',
          palette: { ...VALID_PALETTE, accent: '#2F5BEA' },
        },
      },
      themeKey: 'custom-light-1',
    });

    const saved = prisma.userPreference.upsert.mock.calls[0][0].update as {
      themeKey: string;
      customThemes: Record<string, { name: string; palette: Record<string, string> }>;
    };
    expect(saved.themeKey).toBe('custom-light-1');
    expect(saved.customThemes['custom-light-1'].name).toBe('Mavi kağıt');
    expect(saved.customThemes['custom-light-1'].palette.accent).toBe('#2f5bea');
  });

  it('geçersiz hex renk reddedilir', async () => {
    const { service } = createService();
    await expect(
      service.update('u1', {
        customThemes: {
          'custom-light-1': {
            name: 'Test',
            palette: { ...VALID_PALETTE, text: 'red' },
          },
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('bilinmeyen özel tema anahtarı reddedilir', async () => {
    const { service } = createService();
    await expect(
      service.update('u1', {
        customThemes: {
          'custom-blue-9': { name: 'Test', palette: VALID_PALETTE },
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('yazı boyutu yalnızca dört seçenekten biri olabilir', async () => {
    const { service } = createService();
    await expect(service.update('u1', { fontScale: 'huge' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.update('u1', { fontScale: 'large' })).resolves.toMatchObject({
      fontScale: 'large',
    });
  });
});
