'use client';

import type { ReactNode } from 'react';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Basit satır içi `**kalın**` + kaçış; tam markdown parser bağımlılığı yok. */
function renderLine(line: string): ReactNode {
  const parts: ReactNode[] = [];
  const segments: string[] = line.split('**');
  for (let i = 0; i < segments.length; i += 1) {
    const seg: string = segments[i] ?? '';
    if (seg.length === 0) {
      continue;
    }
    if (i % 2 === 1) {
      parts.push(
        <strong key={`b-${i}`} className="font-semibold text-[var(--foreground)]">
          {escapeHtml(seg)}
        </strong>,
      );
    } else {
      parts.push(
        <span key={`t-${i}`}>{escapeHtml(seg)}</span>,
      );
    }
  }
  return parts.length === 0 ? null : parts;
}

export interface MarkdownSafePreviewProps {
  readonly content: string;
  readonly className?: string;
}

export function MarkdownSafePreview(
  props: MarkdownSafePreviewProps,
): ReactNode {
  const { content, className } = props;
  const lines: string[] = content.split('\n');
  const rootClass: string =
    className ??
    'max-h-48 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]/80 p-3 text-xs leading-relaxed text-[var(--foreground)]';
  return (
    <div className={rootClass}>
      {lines.map((line: string, index: number) => (
        <p
          key={`ln-${index}`}
          className="mb-1 break-words last:mb-0 [&:empty]:mb-0 [&:empty]:hidden"
        >
          {renderLine(line)}
        </p>
      ))}
    </div>
  );
}
