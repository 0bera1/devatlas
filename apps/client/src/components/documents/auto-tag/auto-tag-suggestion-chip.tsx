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
      className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
    >
      #{tag}
    </button>
  );
}
