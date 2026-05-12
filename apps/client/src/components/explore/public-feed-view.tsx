'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { DocumentsListSkeleton } from '@/components/documents/documents-list-skeleton';
import { useAuth } from '@/components/providers/auth-provider';
import { usePublicDocumentsQuery } from '@/features/documents/queries/useDocument';
import { useFormatDocumentDate } from '@/hooks/use-format-document-date';
import { useTranslations } from '@/hooks/use-translations';
import type { DocumentRecord } from '@/domains/documentsDomains';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export function PublicFeedView(): ReactNode {
  const { t } = useTranslations();
  const formatUpdatedAt = useFormatDocumentDate();
  const { token, isReady } = useAuth();
  const loggedIn: boolean = isReady && token !== null;

  const { data, isPending, isError, error, refetch } = usePublicDocumentsQuery();

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const items: DocumentRecord[] = data ?? [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 lg:py-14">
      <header className="flex flex-col gap-2">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {t('explore.title')}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t('explore.intro')}
        </p>
        {!loggedIn && isReady ? (
          <p className="max-w-xl text-sm text-amber-800 dark:text-amber-200">
            {t('explore.hintLogin')}{' '}
            <Link
              href="/login"
              className="font-medium underline-offset-4 hover:underline"
            >
              {t('nav.login')}
            </Link>
          </p>
        ) : null}
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
        <DocumentsListSkeleton />
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t('explore.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((doc: DocumentRecord) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-zinc-950 dark:text-zinc-50">
                  {doc.title}
                </span>
                <span className="mt-1 text-xs text-zinc-500 sm:mt-0 sm:text-right">
                  {t('explore.updated')}: {formatUpdatedAt(doc.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
