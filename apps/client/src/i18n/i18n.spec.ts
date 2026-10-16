import { describe, expect, it } from 'vitest';
import { getMessages, locales, rtlLocales, isLocale, localeNames, type MessageKey } from './index';

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

  it('her dilin çeviri tablosu tüm anahtarları içerir', () => {
    const referenceKeys = Object.keys(getMessages('tr')).sort();
    for (const code of locales) {
      const table = getMessages(code);
      expect(Object.keys(table).sort(), code).toEqual(referenceKeys);
      for (const key of referenceKeys) {
        expect(table[key as MessageKey], `${code}:${key}`).toBeTruthy();
      }
    }
  });

  it('Çince mesajlar İngilizce tablodan ayrıdır', () => {
    expect(getMessages('zh')).not.toBe(getMessages('en'));
  });
});
