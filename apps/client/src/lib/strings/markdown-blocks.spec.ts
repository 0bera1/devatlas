import { describe, expect, it } from 'vitest';
import { extractMarkdownHeadings, parseMarkdownBlocks, slugifyHeading } from './markdown-blocks';

describe('Markdown blokları', () => {
  it('başlık, paragraf, liste, alıntı ve kod bloklarını ayırır', () => {
    const blocks = parseMarkdownBlocks('## Giriş\nMetin\n- bir\n- iki\n> not\n```\nconst a = 1;\n```');
    expect(blocks.map((block) => block.kind)).toEqual(['h2', 'paragraph', 'ul', 'blockquote', 'code']);
    const code = blocks[4];
    expect(code?.kind === 'code' ? code.text : '').toBe('const a = 1;');
  });

  it('tek # başlığı ikinci seviye sayar', () => {
    expect(parseMarkdownBlocks('# Belge')[0]?.kind).toBe('h2');
  });

  it('başlık kimliklerini Türkçe harfleri koruyarak üretir ve tekrarları ayırır', () => {
    expect(slugifyHeading('Sıralama Garantisi')).toBe('sıralama-garantisi');
    const headings = extractMarkdownHeadings('## Örnek\n### Ayrıntı\n## Örnek');
    expect(headings.map((h) => h.id)).toEqual(['bolum-örnek', 'bolum-ayrıntı', 'bolum-örnek-2']);
    expect(headings.map((h) => h.level)).toEqual([2, 3, 2]);
  });

  it('içindekiler kimlikleri içerikteki başlık kimlikleriyle aynıdır', () => {
    const content = '## Kuyruklar\nmetin\n### Yeniden deneme';
    const ids = parseMarkdownBlocks(content)
      .filter((block) => block.kind === 'h2' || block.kind === 'h3')
      .map((block) => ('id' in block ? block.id : ''));
    expect(extractMarkdownHeadings(content).map((h) => h.id)).toEqual(ids);
  });
});
