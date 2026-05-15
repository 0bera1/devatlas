'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useSearchPublicQuery } from '@/features/search/queries/useSearchPublicQuery';
import { useDebouncedValue } from '@/hooks/ui/use-debounced-value';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { PublicSearchHit } from '@/domains/search/searchDomains';
import { formatUserDisplayName } from '@/lib/user/format-user-display-name';
import Link from 'next/link';
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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 lg:py-14">
      <header className="flex flex-col gap-2">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {t('search.title')}
        </h1>
        <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
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
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            {t('documents.list.refresh')}
          </button>
        </div>
      ) : null}

      {trimmedDebounced.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t('search.emptyPrompt')}
        </p>
      ) : loadingResults ? (
        <ul className="flex flex-col gap-3">
          {[0, 1, 2].map((i: number) => (
            <li
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </ul>
      ) : hits.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t('search.noResults')}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {hits.map((hit: PublicSearchHit) => {
            const displayName: string = formatUserDisplayName(
              hit.author.firstName,
              hit.author.lastName,
            );
            const authorLabel: string =
              displayName.length > 0 ? displayName : hit.author.email;

            switch (hit.kind) {
              case 'document': {
                return (
                  <li key={`doc-${hit.id}`}>
                    <Link
                      href={`/documents/${hit.id}`}
                      className="block rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
                          {t('search.kindDocument')}
                        </span>
                        <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
                          {hit.title}
                        </h2>
                      </div>
                      {hit.preview.length > 0 ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {hit.preview}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>
                          {t('search.author')}:{' '}
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {authorLabel}
                          </span>
                        </span>
                        <span>
                          {t('documents.engagement.favorites')}:{' '}
                          {hit.favoriteCount}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              }
              case 'diagram': {
                return (
                  <li key={`dia-${hit.id}`}>
                    <Link
                      href={`/diagrams/${hit.id}`}
                      className="block rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-violet-200 hover:bg-violet-50/50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-violet-900 dark:hover:bg-violet-950/20"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-900 dark:bg-violet-950/60 dark:text-violet-200">
                          {t('search.kindDiagram')}
                        </span>
                        <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
                          {hit.title}
                        </h2>
                      </div>
                      {hit.preview.length > 0 ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {hit.preview}
                        </p>
                      ) : null}
                      <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                        {t('search.author')}:{' '}
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {authorLabel}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              }
              default: {
                const _exhaustive: never = hit;
                return _exhaustive;
              }
            }
          })}
        </ul>
      )}
    </main>
  );
}
