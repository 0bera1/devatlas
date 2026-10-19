import { decodeBasicHtmlEntities } from '@/lib/strings/decode-basic-html-entities';

/** Bilgi tabanı içeriğinde desteklenen Markdown blokları. Başlıklar, içindekiler için kimlik taşır. */
export type MarkdownBlock =
  | { readonly kind: 'h2'; readonly text: string; readonly id: string }
  | { readonly kind: 'h3'; readonly text: string; readonly id: string }
  | { readonly kind: 'paragraph'; readonly text: string }
  | { readonly kind: 'blockquote'; readonly text: string }
  | { readonly kind: 'code'; readonly text: string }
  | { readonly kind: 'ul'; readonly items: readonly string[] }
  | { readonly kind: 'ol'; readonly items: readonly string[] }
  | { readonly kind: 'table'; readonly rows: readonly (readonly string[])[] };

export interface MarkdownHeading {
  readonly id: string;
  readonly text: string;
  readonly level: 2 | 3;
}

/** Başlık metninden adres çubuğunda okunabilir bir kimlik üretir; Türkçe harfler korunur. */
export function slugifyHeading(text: string): string {
  const slug: string = text
    .replace(/[*`_]/g, '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'bolum';
}

function isTableSeparatorRow(cells: readonly string[]): boolean {
  return cells.length > 0 && cells.every((cell: string) => /^:?-+:?$/.test(cell));
}

function parseTableRow(line: string): readonly string[] {
  return line
    .split('|')
    .map((cell: string) => cell.trim())
    .filter((cell: string) => cell.length > 0);
}

export function parseMarkdownBlocks(content: string): readonly MarkdownBlock[] {
  const lines: string[] = decodeBasicHtmlEntities(content).split('\n');
  const blocks: MarkdownBlock[] = [];
  const usedIds = new Map<string, number>();
  let index = 0;

  const uniqueId = (text: string): string => {
    const base: string = `bolum-${slugifyHeading(text)}`;
    const seen: number = usedIds.get(base) ?? 0;
    usedIds.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  };

  while (index < lines.length) {
    const trimmed: string = lines[index]?.trim() ?? '';
    if (trimmed.length === 0) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index]?.trim() ?? '').startsWith('```')) {
        code.push(lines[index] ?? '');
        index += 1;
      }
      index += 1; // kapanış çiti
      blocks.push({ kind: 'code', text: code.join('\n') });
      continue;
    }

    // Tek "#" belge başlığı sayfa başlığıyla çakıştığı için ikinci seviye başlık olarak ele alınır.
    const heading: RegExpMatchArray | null = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (heading !== null) {
      const text: string = heading[2] ?? '';
      blocks.push(heading[1] === '###' ? { kind: 'h3', text, id: uniqueId(text) } : { kind: 'h2', text, id: uniqueId(text) });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('> ')) {
      blocks.push({ kind: 'blockquote', text: trimmed.slice(2) });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('|')) {
      const rows: string[][] = [];
      while (index < lines.length && (lines[index]?.trim() ?? '').startsWith('|')) {
        const cells: readonly string[] = parseTableRow(lines[index] ?? '');
        if (!isTableSeparatorRow(cells)) {
          rows.push([...cells]);
        }
        index += 1;
      }
      if (rows.length > 0) {
        blocks.push({ kind: 'table', rows });
      }
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s/.test(lines[index]?.trim() ?? '')) {
        items.push((lines[index]?.trim() ?? '').replace(/^\d+\.\s/, ''));
        index += 1;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }

    if (/^[-*]\s/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s/.test(lines[index]?.trim() ?? '')) {
        items.push((lines[index]?.trim() ?? '').slice(2));
        index += 1;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }

    blocks.push({ kind: 'paragraph', text: trimmed });
    index += 1;
  }

  return blocks;
}

/** İçindekiler listesi için ikinci ve üçüncü seviye başlıklar. Kimlikler içerikteki başlıklarla aynıdır. */
export function extractMarkdownHeadings(content: string): readonly MarkdownHeading[] {
  const headings: MarkdownHeading[] = [];
  for (const block of parseMarkdownBlocks(content)) {
    if (block.kind === 'h2' || block.kind === 'h3') {
      headings.push({ id: block.id, text: block.text.replace(/[*`]/g, ''), level: block.kind === 'h2' ? 2 : 3 });
    }
  }
  return headings;
}
