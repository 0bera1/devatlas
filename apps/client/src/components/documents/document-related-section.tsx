'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useRelatedDocumentsQuery } from '@/features/documents/queries/useDocument';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { DocumentRecord } from '@/domains/documents/documentsDomains';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export interface DocumentRelatedSectionProps {
  readonly documentId: string;
  readonly enabled: boolean;
}

export function DocumentRelatedSection(
  props: DocumentRelatedSectionProps,
): ReactNode {
  const { documentId, enabled } = props;
  const { t } = useTranslations();

  const { data, isPending, isError, error } = useRelatedDocumentsQuery(
    documentId,
    enabled,
  );

  const items: DocumentRecord[] = data ?? [];

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {t('documents.related.title')}
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {t('documents.related.subtitle')}
      </p>
      {errorMessage !== null ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      ) : null}
      {isPending && !isError ? (
        <ul className="mt-4 flex flex-col gap-2">
          {[0, 1, 2].map((i: number) => (
            <li
              key={i}
              className="h-12 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </ul>
      ) : null}
      {!isPending && items.length === 0 && errorMessage === null ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          {t('documents.related.empty')}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((doc: DocumentRecord) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="block rounded-xl border border-zinc-200 px-3 py-2 text-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50"
              >
                <span className="font-medium text-zinc-950 dark:text-zinc-50">
                  {doc.title}
                </span>
                <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                  {t('documents.engagement.favorites')}: {doc.favoriteCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
