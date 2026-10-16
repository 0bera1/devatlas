'use client';

import type { ReactNode } from 'react';

export interface AutoTagSuggestionChipProps {
  readonly tag: string;
  readonly disabled: boolean;
  readonly onSelect: (tag: string) => void;
}

export function AutoTagSuggestionChip({
  tag,
  disabled,
  onSelect,
}: AutoTagSuggestionChipProps): ReactNode {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect(tag);
      }}
      disabled={disabled}
      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)] disabled:opacity-40"
    >
      #{tag}
    </button>
  );
}
