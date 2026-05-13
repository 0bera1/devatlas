'use client';

import type { ReactNode } from 'react';
import { AutoTagSuggestionChip } from './auto-tag-suggestion-chip';

export interface AutoTagSuggestionListProps {
  readonly suggestions: readonly string[];
  readonly disabled: boolean;
  readonly onSelect: (tag: string) => void;
}

export function AutoTagSuggestionList({
  suggestions,
  disabled,
  onSelect,
}: AutoTagSuggestionListProps): ReactNode {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((tag: string) => (
        <AutoTagSuggestionChip
          key={tag}
          tag={tag}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
