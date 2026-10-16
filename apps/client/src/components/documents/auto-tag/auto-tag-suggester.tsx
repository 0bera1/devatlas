'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import { useAutoTagSuggester } from '@/hooks/documents/use-auto-tag-suggester';
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
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-40"
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
            className="rounded-lg bg-[var(--foreground)] px-2.5 py-1 text-xs font-medium text-[var(--background)] transition-colors hover:bg-[var(--foreground)] disabled:opacity-40"
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
        <p className="text-xs text-[var(--muted)]">
          {t('documents.autoTag.hint')}
        </p>
      ) : null}
    </div>
  );
}
