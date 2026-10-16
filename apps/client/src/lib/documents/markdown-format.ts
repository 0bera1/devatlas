export type MarkdownFormat = 'bold' | 'italic' | 'code' | 'heading' | 'list' | 'quote';

export interface FormatResult {
  readonly text: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
}

const INLINE_MARKERS: Partial<Record<MarkdownFormat, { open: string; close: string; placeholder: string }>> = {
  bold: { open: '**', close: '**', placeholder: 'kalın' },
  italic: { open: '*', close: '*', placeholder: 'italik' },
  code: { open: '`', close: '`', placeholder: 'kod' },
};

const LINE_PREFIXES: Partial<Record<MarkdownFormat, string>> = {
  heading: '## ',
  list: '- ',
  quote: '> ',
};

/** Seçili metni (ya da imleç konumunu) Markdown biçimine çevirir. Saf fonksiyon; tarayıcıya bağlı değildir. */
export function applyMarkdownFormat(text: string, start: number, end: number, format: MarkdownFormat): FormatResult {
  const inline = INLINE_MARKERS[format];
  if (inline !== undefined) {
    const selected: string = text.slice(start, end);
    const body: string = selected.length > 0 ? selected : inline.placeholder;
    const next: string = `${text.slice(0, start)}${inline.open}${body}${inline.close}${text.slice(end)}`;
    const selectionStart: number = start + inline.open.length;
    return { text: next, selectionStart, selectionEnd: selectionStart + body.length };
  }

  const prefix: string = LINE_PREFIXES[format] ?? '';
  const lineStart: number = text.lastIndexOf('\n', start - 1) + 1;
  const lineEndIndex: number = text.indexOf('\n', end);
  const lineEnd: number = lineEndIndex === -1 ? text.length : lineEndIndex;
  const block: string = text.slice(lineStart, lineEnd);
  const prefixed: string = block
    .split('\n')
    .map((line: string): string => `${prefix}${line}`)
    .join('\n');
  const next: string = `${text.slice(0, lineStart)}${prefixed}${text.slice(lineEnd)}`;
  return { text: next, selectionStart: lineStart, selectionEnd: lineStart + prefixed.length };
}
