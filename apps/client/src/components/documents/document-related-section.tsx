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
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">
        {t('documents.related.title')}
      </h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
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
              className="h-12 animate-pulse rounded-xl bg-[var(--border)]"
            />
          ))}
        </ul>
      ) : null}
      {!isPending && items.length === 0 && errorMessage === null ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {t('documents.related.empty')}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((doc: DocumentRecord) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="block rounded-xl border border-[var(--border)] px-3 py-2 text-sm transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)]"
              >
                <span className="font-medium text-[var(--foreground)]">
                  {doc.title}
                </span>
                <span className="mt-1 block text-xs text-[var(--muted)]">
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
