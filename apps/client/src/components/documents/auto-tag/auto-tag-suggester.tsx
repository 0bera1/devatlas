'use client';

import { useTranslations } from '@/hooks/use-translations';
import { useAutoTagSuggester } from '@/hooks/use-auto-tag-suggester';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { AutoTagSuggestionList } from './auto-tag-suggestion-list';

export interface AutoTagSuggesterProps {
  readonly title: string;
  readonly onTagAccepted: (tag: string) => void;
}

/**
 * Doküman oluştururken kullanıcının başlığa göre teknoloji etiketi
 * önerileri almasını sağlayan akıllı yardımcı.
 *
 * Sorumluluklar:
 * - Mevcut başlığı backend'e gönderir
 * - Dönen etiketleri chip listesi olarak gösterir
 * - Chip tıklanınca üst forma `onTagAccepted` ile bildirir
 */
export function AutoTagSuggester({
  title,
  onTagAccepted,
}: AutoTagSuggesterProps): ReactNode {
  const { t } = useTranslations();
  const {
    suggestions,
    isPending,
    errorMessage,
    fetch,
    removeSuggestion,
  } = useAutoTagSuggester();

  const onSuggestClick = useCallback((): void => {
    void fetch(title);
  }, [fetch, title]);

  const onApplyAll = useCallback((): void => {
    for (const tag of suggestions) {
      onTagAccepted(tag);
    }
    suggestions.forEach((tag: string) => {
      removeSuggestion(tag);
    });
  }, [onTagAccepted, removeSuggestion, suggestions]);

  const onChipSelect = useCallback(
    (tag: string): void => {
      onTagAccepted(tag);
      removeSuggestion(tag);
    },
    [onTagAccepted, removeSuggestion],
  );

  const hasSuggestions: boolean = suggestions.length > 0;
  const disabledFetch: boolean = isPending || title.trim().length === 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSuggestClick}
          disabled={disabledFetch}
          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          {isPending
            ? t('documents.autoTag.loading')
            : t('documents.autoTag.suggest')}
        </button>
        {hasSuggestions ? (
          <button
            type="button"
            onClick={onApplyAll}
            disabled={isPending}
            className="rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t('documents.autoTag.applyAll')}
          </button>
        ) : null}
      </div>

      {errorMessage !== null ? (
        <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
      ) : null}

      <AutoTagSuggestionList
        suggestions={suggestions}
        disabled={isPending}
        onSelect={onChipSelect}
      />

      {!hasSuggestions && errorMessage === null && !isPending ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t('documents.autoTag.hint')}
        </p>
      ) : null}
    </div>
  );
}
