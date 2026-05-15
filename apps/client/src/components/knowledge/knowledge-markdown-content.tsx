'use client';

import type { ReactNode } from 'react';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(text: string, keyPrefix: string): ReactNode {
  const parts: ReactNode[] = [];
  const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIndex = 0;

  while ((match = tokenPattern.exec(text)) !== null) {
    const before: string = text.slice(lastIndex, match.index);
    if (before.length > 0) {
      parts.push(
        <span key={`${keyPrefix}-t-${partIndex}`}>{escapeHtml(before)}</span>,
      );
      partIndex += 1;
    }

    const token: string = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong
          key={`${keyPrefix}-b-${partIndex}`}
          className="font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {escapeHtml(token.slice(2, -2))}
        </strong>,
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`${keyPrefix}-c-${partIndex}`}
          className="rounded bg-zinc-200/80 px-1 py-0.5 font-mono text-[0.85em] text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {escapeHtml(token.slice(1, -1))}
        </code>,
      );
    }
    partIndex += 1;
    lastIndex = match.index + token.length;
  }

  const tail: string = text.slice(lastIndex);
  if (tail.length > 0) {
    parts.push(
      <span key={`${keyPrefix}-t-${partIndex}`}>{escapeHtml(tail)}</span>,
    );
  }

  return parts.length > 0 ? parts : escapeHtml(text);
}

type MarkdownBlock =
  | { readonly kind: 'h2'; readonly text: string }
  | { readonly kind: 'h3'; readonly text: string }
  | { readonly kind: 'paragraph'; readonly text: string }
  | { readonly kind: 'blockquote'; readonly text: string }
  | { readonly kind: 'ul'; readonly items: readonly string[] }
  | { readonly kind: 'ol'; readonly items: readonly string[] }
  | { readonly kind: 'table'; readonly rows: readonly (readonly string[])[] };

function isTableSeparatorRow(cells: readonly string[]): boolean {
  return cells.length > 0 && cells.every((cell: string) => /^-+$/.test(cell));
}

function parseTableRow(line: string): readonly string[] {
  return line
    .split('|')
    .map((cell: string) => cell.trim())
    .filter((cell: string) => cell.length > 0);
}

function parseMarkdownBlocks(content: string): readonly MarkdownBlock[] {
  const lines: string[] = content.split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const trimmed: string = lines[index]?.trim() ?? '';
    if (trimmed.length === 0) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({ kind: 'h2', text: trimmed.slice(3) });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ kind: 'h3', text: trimmed.slice(4) });
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
        const itemLine: string = lines[index]?.trim() ?? '';
        items.push(itemLine.replace(/^\d+\.\s/, ''));
        index += 1;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }

    if (trimmed.startsWith('- ')) {
      const items: string[] = [];
      while (index < lines.length && (lines[index]?.trim() ?? '').startsWith('- ')) {
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

export interface KnowledgeMarkdownContentProps {
  readonly content: string;
  readonly className?: string;
}

export function KnowledgeMarkdownContent(
  props: KnowledgeMarkdownContentProps,
): ReactNode {
  const { content, className } = props;
  const blocks: readonly MarkdownBlock[] = parseMarkdownBlocks(content);
  const rootClass: string =
    className ??
    'flex flex-col gap-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200';

  return (
    <div className={rootClass}>
      {blocks.map((block: MarkdownBlock, blockIndex: number) => {
        const key: string = `md-block-${blockIndex}`;
        switch (block.kind) {
          case 'h2':
            return (
              <h2
                key={key}
                className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
              >
                {renderInline(block.text, key)}
              </h2>
            );
          case 'h3':
            return (
              <h3
                key={key}
                className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
              >
                {renderInline(block.text, key)}
              </h3>
            );
          case 'paragraph':
            return (
              <p key={key} className="break-words">
                {renderInline(block.text, key)}
              </p>
            );
          case 'blockquote':
            return (
              <blockquote
                key={key}
                className="border-l-4 border-indigo-300/80 py-0.5 pl-4 text-zinc-700 dark:border-indigo-600 dark:text-zinc-300"
              >
                {renderInline(block.text, key)}
              </blockquote>
            );
          case 'ul':
            return (
              <ul key={key} className="list-disc space-y-1.5 pl-5">
                {block.items.map((item: string, itemIndex: number) => (
                  <li key={`${key}-li-${itemIndex}`} className="break-words">
                    {renderInline(item, `${key}-li-${itemIndex}`)}
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key} className="list-decimal space-y-1.5 pl-5">
                {block.items.map((item: string, itemIndex: number) => (
                  <li key={`${key}-li-${itemIndex}`} className="break-words">
                    {renderInline(item, `${key}-li-${itemIndex}`)}
                  </li>
                ))}
              </ol>
            );
          case 'table':
            return (
              <div
                key={key}
                className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <table className="w-full min-w-[280px] text-left text-xs">
                  <tbody>
                    {block.rows.map((row: readonly string[], rowIndex: number) => (
                      <tr
                        key={`${key}-row-${rowIndex}`}
                        className={
                          rowIndex === 0
                            ? 'bg-zinc-100/80 font-semibold dark:bg-zinc-800/80'
                            : 'border-t border-zinc-200 dark:border-zinc-700'
                        }
                      >
                        {row.map((cell: string, cellIndex: number) => (
                          <td key={`${key}-cell-${rowIndex}-${cellIndex}`} className="px-3 py-2">
                            {renderInline(cell, `${key}-cell-${rowIndex}-${cellIndex}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
