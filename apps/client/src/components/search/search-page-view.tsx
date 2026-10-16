'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useSearchPublicQuery } from '@/features/search/queries/useSearchPublicQuery';
import { useDebouncedValue } from '@/hooks/ui/use-debounced-value';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { SearchHitCard } from '@/components/search/search-hit-card';
import type { PublicSearchHit } from '@/domains/search/searchDomains';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

export function SearchPageView(): ReactNode {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [input, setInput] = useState<string>(() => searchParams.get('q') ?? '');

  useEffect(() => {
    const onPop = (): void => {
      const q: string =
        new URLSearchParams(window.location.search).get('q') ?? '';
      setInput(q);
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  const debouncedInput: string = useDebouncedValue(input, 300);
  const trimmedDebounced: string = debouncedInput.trim();

  useLayoutEffect(() => {
    const urlTrimmed: string = (searchParams.get('q') ?? '').trim();
    if (trimmedDebounced === urlTrimmed) {
      return;
    }
    if (trimmedDebounced.length === 0) {
      router.replace('/search', { scroll: false });
      return;
    }
    router.replace(
      `/search?q=${encodeURIComponent(trimmedDebounced)}`,
      { scroll: false },
    );
  }, [trimmedDebounced, router, searchParams]);

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useSearchPublicQuery(trimmedDebounced);

  const hits: PublicSearchHit[] = data ?? [];

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const loadingResults: boolean =
    trimmedDebounced.length > 0 && (isPending || isFetching);

  const hitKey = (hit: PublicSearchHit): string => {
    switch (hit.kind) {
      case 'document':
      case 'diagram':
        return `${hit.kind}-${hit.id}`;
      case 'knowledge_document':
      case 'knowledge_diagram':
      case 'knowledge_flow':
      case 'interview_question':
        return `${hit.kind}-${hit.slug}`;
      default: {
        const _exhaustive: never = hit;
        return _exhaustive;
      }
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 lg:py-14">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          {t('search.title')}
        </h1>
        <p className="max-w-xl text-sm text-[var(--muted)]">
          {t('search.subtitle')}
        </p>
        <label className="mt-2 block">
          <span className="sr-only">{t('search.inputLabel')}</span>
          <input
            type="search"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            placeholder={t('search.placeholder')}
            autoComplete="off"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-[var(--border)] focus:ring-2"
          />
        </label>
        <p className="text-xs text-[var(--muted)]">
          {t('search.debounceHint')}
        </p>
      </header>

      {errorMessage !== null ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {trimmedDebounced.length > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            disabled={isFetching}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
          >
            {t('documents.list.refresh')}
          </button>
        </div>
      ) : null}

      {trimmedDebounced.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-10 text-center text-sm text-[var(--muted)]">
          {t('search.emptyPrompt')}
        </p>
      ) : loadingResults ? (
        <ul className="flex flex-col gap-3">
          {[0, 1, 2].map((i: number) => (
            <li
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-[var(--border)]"
            />
          ))}
        </ul>
      ) : hits.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-10 text-center text-sm text-[var(--muted)]">
          {t('search.noResults')}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {hits.map((hit: PublicSearchHit) => (
            <li key={hitKey(hit)}>
              <SearchHitCard hit={hit} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
