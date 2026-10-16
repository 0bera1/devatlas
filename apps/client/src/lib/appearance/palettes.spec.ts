import { describe, expect, it } from 'vitest';
import {
  BUILT_IN_PALETTES,
  CUSTOM_SEED_PALETTE,
  FONT_SCALE_PX,
  modeForThemeKey,
  resolvePalette,
  type CustomThemes,
} from './palettes';

describe('resolvePalette', () => {
  it('hazır temada kendi paletini döndürür', () => {
    expect(resolvePalette('dark-night', {})).toEqual(BUILT_IN_PALETTES['dark-night'].palette);
  });

  it('kayıtlı özel temanın paletini kullanır', () => {
    const custom: CustomThemes = {
      'custom-light-1': {
        name: 'Mavi',
        palette: { ...BUILT_IN_PALETTES['light-default'].palette, accent: '#2f5bea' },
      },
    };
    expect(resolvePalette('custom-light-1', custom).accent).toBe('#2f5bea');
  });

  it('kayıtlı olmayan özel tema için modun varsayılanına döner', () => {
    expect(resolvePalette('custom-dark-2', {})).toEqual(CUSTOM_SEED_PALETTE.dark);
    expect(resolvePalette('custom-light-2', {})).toEqual(CUSTOM_SEED_PALETTE.light);
  });
});

describe('modeForThemeKey', () => {
  it('hazır temaların modunu doğru verir', () => {
    expect(modeForThemeKey('light-warm')).toBe('light');
    expect(modeForThemeKey('dark-default')).toBe('dark');
  });

  it('özel temaların modunu anahtar adından çıkarır', () => {
    expect(modeForThemeKey('custom-dark-1')).toBe('dark');
    expect(modeForThemeKey('custom-light-2')).toBe('light');
  });
});

describe('yazı boyutu', () => {
  it('dört seçenek ve artan piksel değerleri vardır', () => {
    const values = Object.values(FONT_SCALE_PX);
    expect(values).toHaveLength(4);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });
});
