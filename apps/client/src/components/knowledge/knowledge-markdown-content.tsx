'use client';

import { decodeBasicHtmlEntities } from '@/lib/strings/decode-basic-html-entities';
import { parseMarkdownBlocks, type MarkdownBlock } from '@/lib/strings/markdown-blocks';
import type { ReactNode } from 'react';

function renderInline(text: string, keyPrefix: string): ReactNode {
  const decoded: string = decodeBasicHtmlEntities(text);
  const parts: ReactNode[] = [];
  const re: RegExp = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIndex = 0;

  while ((match = re.exec(decoded)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`${keyPrefix}-p-${partIndex}`}>{decoded.slice(lastIndex, match.index)}</span>);
      partIndex += 1;
    }
    const token: string = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`${keyPrefix}-b-${partIndex}`} className="font-semibold text-[var(--foreground)]">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={`${keyPrefix}-c-${partIndex}`} className="rounded bg-[var(--border)]/70 px-1 py-0.5 font-mono text-[0.85em] text-[var(--foreground)]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`${keyPrefix}-i-${partIndex}`} className="italic text-[var(--foreground)]">
          {token.slice(1, -1)}
        </em>,
      );
    }
    partIndex += 1;
    lastIndex = match.index + token.length;
  }

  if (lastIndex < decoded.length) {
    parts.push(<span key={`${keyPrefix}-tail`}>{decoded.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : decoded;
}

export type KnowledgeMarkdownVariant = 'compact' | 'article';

interface VariantClasses {
  readonly root: string;
  readonly h2: string;
  readonly h3: string;
  readonly paragraph: string;
  readonly quote: string;
  readonly list: string;
  readonly code: string;
}

const VARIANTS: Readonly<Record<KnowledgeMarkdownVariant, VariantClasses>> = {
  compact: {
    root: 'flex flex-col gap-3 text-sm leading-relaxed text-[var(--foreground)]',
    h2: 'text-lg font-semibold tracking-tight text-[var(--foreground)]',
    h3: 'text-base font-semibold text-[var(--foreground)]',
    paragraph: 'break-words',
    quote: 'border-l-2 border-[var(--accent)] py-0.5 pl-4 text-[var(--foreground)]',
    list: 'space-y-1.5 pl-5',
    code: 'overflow-x-auto rounded-lg bg-[var(--border)]/50 px-4 py-3 font-mono text-xs leading-relaxed',
  },
  // Doküman sayfası: serif gövde ve başlıklar, başlıklar arasında geniş boşluk.
  article: {
    root: 'flex flex-col gap-5 font-serif text-[19px] leading-[1.65] text-[var(--foreground)]',
    h2: 'mt-6 scroll-mt-24 font-serif text-[28px] font-medium leading-tight tracking-tight sm:text-[30px]',
    h3: 'mt-3 scroll-mt-24 font-serif text-[22px] font-medium leading-snug',
    paragraph: 'break-words',
    quote: 'border-l-2 border-[var(--accent)] py-0.5 pl-5 font-sans text-[15px] leading-relaxed text-[var(--foreground)]',
    list: 'space-y-2 pl-6',
    code: 'overflow-x-auto rounded-lg bg-[var(--border)]/50 px-5 py-4 font-mono text-[13px] leading-relaxed',
  },
};

export interface KnowledgeMarkdownContentProps {
  readonly content: string;
  readonly className?: string;
  readonly variant?: KnowledgeMarkdownVariant;
}

export function KnowledgeMarkdownContent(props: KnowledgeMarkdownContentProps): ReactNode {
  const { content, className, variant = 'compact' } = props;
  const blocks: readonly MarkdownBlock[] = parseMarkdownBlocks(content);
  const styles: VariantClasses = VARIANTS[variant];

  return (
    <div className={className ?? styles.root}>
      {blocks.map((block: MarkdownBlock, blockIndex: number) => {
        const key: string = `md-block-${blockIndex}`;
        switch (block.kind) {
          case 'h2':
            return (
              <h2 key={key} id={block.id} className={styles.h2}>
                {renderInline(block.text, key)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={key} id={block.id} className={styles.h3}>
                {renderInline(block.text, key)}
              </h3>
            );
          case 'paragraph':
            return (
              <p key={key} className={styles.paragraph}>
                {renderInline(block.text, key)}
              </p>
            );
          case 'blockquote':
            return (
              <blockquote key={key} className={styles.quote}>
                {renderInline(block.text, key)}
              </blockquote>
            );
          case 'code':
            return (
              <pre key={key} className={styles.code}>
                <code>{block.text}</code>
              </pre>
            );
          case 'ul':
            return (
              <ul key={key} className={`list-disc ${styles.list}`}>
                {block.items.map((item: string, itemIndex: number) => (
                  <li key={`${key}-li-${itemIndex}`} className="break-words">
                    {renderInline(item, `${key}-li-${itemIndex}`)}
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key} className={`list-decimal ${styles.list}`}>
                {block.items.map((item: string, itemIndex: number) => (
                  <li key={`${key}-li-${itemIndex}`} className="break-words">
                    {renderInline(item, `${key}-li-${itemIndex}`)}
                  </li>
                ))}
              </ol>
            );
          case 'table':
            return (
              <div key={key} className="overflow-x-auto rounded-lg border border-[var(--border)] font-sans">
                <table className="w-full min-w-[280px] text-left text-sm">
                  <tbody>
                    {block.rows.map((row: readonly string[], rowIndex: number) => (
                      <tr
                        key={`${key}-row-${rowIndex}`}
                        className={rowIndex === 0 ? 'bg-[var(--surface)] font-semibold' : 'border-t border-[var(--border)]'}
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
