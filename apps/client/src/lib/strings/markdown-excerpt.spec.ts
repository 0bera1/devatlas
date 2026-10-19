import { describe, expect, it } from 'vitest';
import { markdownExcerpt } from './markdown-excerpt';

describe('Markdown özeti', () => {
  it('başlık, vurgu, kod ve bağlantı işaretlerini atar', () => {
    const text = '# Başlık\n\n**Kafka** ile `partition` sırası [belgede](https://x.y) anlatılır.\n\n```js\nconst a = 1;\n```';
    expect(markdownExcerpt(text)).toBe('Başlık Kafka ile partition sırası belgede anlatılır.');
  });

  it('uzun metni kelime sınırında keser ve üç nokta ekler', () => {
    const text = 'kelime '.repeat(80);
    const result = markdownExcerpt(text, 40);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(41);
    expect(result).not.toMatch(/\s…$/);
  });

  it('liste ve alıntı işaretlerini kaldırır', () => {
    expect(markdownExcerpt('> alıntı\n- bir\n- iki')).toBe('alıntı bir iki');
  });
});
