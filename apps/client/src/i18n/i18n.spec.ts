import { describe, expect, it } from 'vitest';
import { getMessages, locales, rtlLocales, isLocale, localeNames } from './index';

describe('dil desteği', () => {
  it('Türkçe ve on popüler dil desteklenir', () => {
    expect(locales).toHaveLength(11);
    for (const code of locales) {
      expect(localeNames[code].length).toBeGreaterThan(0);
    }
  });

  it('Arapça ve Urduca sağdan sola yazılır', () => {
    expect(rtlLocales).toEqual(['ar', 'ur']);
  });

  it('geçersiz dil kodu reddedilir', () => {
    expect(isLocale('klingon')).toBe(false);
    expect(isLocale('tr')).toBe(true);
  });

  it('çevirisi olmayan dil İngilizce mesajları kullanır', () => {
    expect(getMessages('zh')).toBe(getMessages('en'));
  });
});
