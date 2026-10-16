import { describe, expect, it } from 'vitest';
import { BUILT_IN_PALETTES, BUILT_IN_THEME_KEYS } from './palettes';
import { contrastRatio } from './contrast';

const AA_TEXT = 4.5;
const AA_LARGE_OR_UI = 3;

describe('kontrast ölçümü', () => {
  it('siyah ve beyaz arasında en yüksek oranı verir', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });

  it('aynı renkte oran 1 olur', () => {
    expect(contrastRatio('#808080', '#808080')).toBeCloseTo(1, 5);
  });
});

describe('hazır temalar WCAG AA kontrastını karşılar', () => {
  for (const key of BUILT_IN_THEME_KEYS) {
    const { palette } = BUILT_IN_PALETTES[key];

    it(`${key}: gövde metni ve ikincil metin`, () => {
      expect(contrastRatio(palette.text, palette.background), 'text/background').toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrastRatio(palette.text, palette.surface), 'text/surface').toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrastRatio(palette.muted, palette.background), 'muted/background').toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrastRatio(palette.muted, palette.surface), 'muted/surface').toBeGreaterThanOrEqual(AA_TEXT);
    });

    it(`${key}: vurgu rengi arayüz öğeleri için yeterli`, () => {
      expect(contrastRatio(palette.accent, palette.background), 'accent/background').toBeGreaterThanOrEqual(AA_LARGE_OR_UI);
    });
  }
});
