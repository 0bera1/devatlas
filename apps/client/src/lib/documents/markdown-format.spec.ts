import { describe, expect, it } from 'vitest';
import { applyMarkdownFormat } from './markdown-format';

describe('Markdown biçimlendirme', () => {
  it('seçili metni kalın yapar ve seçimi korur', () => {
    const result = applyMarkdownFormat('merhaba dünya', 8, 13, 'bold');
    expect(result.text).toBe('merhaba **dünya**');
    expect(result.text.slice(result.selectionStart, result.selectionEnd)).toBe('dünya');
  });

  it('seçim yoksa yer tutucuyu imleçle birlikte ekler', () => {
    const result = applyMarkdownFormat('', 0, 0, 'italic');
    expect(result.text).toBe('*italik*');
    expect(result.text.slice(result.selectionStart, result.selectionEnd)).toBe('italik');
  });

  it('kod biçimini tek satırda kullanır', () => {
    expect(applyMarkdownFormat('npm test', 0, 8, 'code').text).toBe('`npm test`');
  });

  it('başlığı imlecin bulunduğu satıra ekler', () => {
    const result = applyMarkdownFormat('birinci\nikinci', 9, 9, 'heading');
    expect(result.text).toBe('birinci\n## ikinci');
  });

  it('liste ve alıntıda seçilen tüm satırlara önek ekler', () => {
    expect(applyMarkdownFormat('a\nb\nc', 0, 3, 'list').text).toBe('- a\n- b\nc');
    expect(applyMarkdownFormat('a\nb', 0, 3, 'quote').text).toBe('> a\n> b');
  });

  it('satır önekinde seçim başlangıcını satır başına taşır', () => {
    const result = applyMarkdownFormat('ilk\nikinci', 6, 6, 'list');
    expect(result.text).toBe('ilk\n- ikinci');
    expect(result.selectionStart).toBe(4);
  });
});
