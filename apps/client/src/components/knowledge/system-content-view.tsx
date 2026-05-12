'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useSystemContentListQuery } from '@/features/system-content/queries/useSystemContentList';
import { useTranslations } from '@/hooks/use-translations';
import type { SystemContentRecord } from '@/domains/systemContentDomains';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export function SystemContentView(): ReactNode {
  const { t } = useTranslations();

  const { data, isPending, isError, error, refetch } =
    useSystemContentListQuery();

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const items: SystemContentRecord[] = data ?? [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 lg:py-14">
      <header className="flex flex-col gap-2">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {t('knowledge.title')}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t('knowledge.intro')}
        </p>
      </header>

      {errorMessage !== null ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            void refetch();
          }}
          disabled={isPending}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          {t('documents.list.refresh')}
        </button>
      </div>

      {isPending ? (
        <div className="animate-pulse space-y-3">
          <div className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t('knowledge.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((row: SystemContentRecord) => (
            <li
              key={row.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {row.title}
                </h2>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {row.type}
                </span>
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-mono text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {row.content}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
