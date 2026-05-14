'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useAutoTagsMutation } from '@/features/intelligence/mutations/useAutoTagsMutation';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useCallback, useMemo, useState } from 'react';

export interface AutoTagSuggesterState {
  readonly suggestions: readonly string[];
  readonly isPending: boolean;
  readonly errorMessage: string | null;
  readonly fetch: (title: string, content?: string) => Promise<void>;
  readonly reset: () => void;
  readonly removeSuggestion: (tag: string) => void;
}

/**
 * Auto-tag öneri akışını kapsülleyen custom hook.
 * UI sadece state'leri okur, button olaylarında metodları çağırır.
 */
export function useAutoTagSuggester(): AutoTagSuggesterState {
  const { t } = useTranslations();
  const {
    mutateAsync,
    isPending,
    isError,
    error,
    reset: resetMutation,
  } = useAutoTagsMutation();

  const [suggestions, setSuggestions] = useState<readonly string[]>([]);

  const errorMessage: string | null = useMemo((): string | null => {
    if (!isError || error === null || error === undefined) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const fetch = useCallback(
    async (title: string, content?: string): Promise<void> => {
      const safeTitle: string = title.trim();
      const safeContent: string | undefined =
        content === undefined ? undefined : content.trim();
      if (
        safeTitle.length === 0 &&
        (safeContent === undefined || safeContent.length === 0)
      ) {
        setSuggestions([]);
        return;
      }
      try {
        const payload =
          safeContent === undefined || safeContent.length === 0
            ? { title: safeTitle }
            : { title: safeTitle, content: safeContent };
        const response = await mutateAsync(payload);
        setSuggestions(response.tags);
      } catch {
        setSuggestions([]);
      }
    },
    [mutateAsync],
  );

  const removeSuggestion = useCallback((tag: string) => {
    setSuggestions((prev: readonly string[]) =>
      prev.filter((current: string) => current !== tag),
    );
  }, []);

  const reset = useCallback(() => {
    setSuggestions([]);
    resetMutation();
  }, [resetMutation]);

  return {
    suggestions,
    isPending,
    errorMessage,
    fetch,
    reset,
    removeSuggestion,
  };
}
