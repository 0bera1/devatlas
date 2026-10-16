'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { DocumentsListSkeleton } from '@/components/documents/documents-list-skeleton';
import { useAuth } from '@/components/providers/auth-provider';
import { usePublicFeedQuery } from '@/features/documents/queries/useDocument';
import { useFormatDocumentDate } from '@/hooks/documents/use-format-document-date';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { DocumentRecord } from '@/domains/documents/documentsDomains';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

type FeedMode = 'latest' | 'trending';

export function PublicFeedView(): ReactNode {
  const { t } = useTranslations();
  const formatUpdatedAt = useFormatDocumentDate();
  const { token, isReady } = useAuth();
  const loggedIn: boolean = isReady && token !== null;

  const [feedMode, setFeedMode] = useState<FeedMode>('latest');
  const { data, isPending, isError, error, refetch } =
    usePublicFeedQuery(feedMode);

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const items: DocumentRecord[] = data ?? [];

  const modes: Array<{ value: FeedMode; label: string }> = [
    { value: 'latest', label: t('explore.feedLatest') },
    { value: 'trending', label: t('explore.feedTrending') },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            {t('explore.title')}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
            {t('explore.intro')}
          </p>
          {!loggedIn && isReady ? (
            <p className="mt-3 text-sm text-[var(--muted)]">
              {t('explore.hintLogin')}{' '}
              <Link href="/login" className="font-medium text-[var(--foreground)] underline underline-offset-4">
                {t('nav.login')}
              </Link>
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div role="tablist" className="inline-flex rounded-full border border-[var(--border)] p-1">
            {modes.map((mode) => {
              const selected: boolean = feedMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setFeedMode(mode.value);
                  }}
                  className={
                    selected
                      ? 'rounded-full bg-[var(--foreground)] px-4 py-1.5 text-sm font-semibold text-[var(--background)]'
                      : 'rounded-full px-4 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]'
                  }
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            disabled={isPending}
            className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
          >
            {t('documents.list.refresh')}
          </button>
        </div>
      </header>

      {errorMessage !== null ? (
        <p className="mt-8 rounded-xl border border-red-300/60 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-10 border-t border-[var(--border)] pt-2">
        {isPending ? (
          <div className="pt-6">
            <DocumentsListSkeleton />
          </div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-[var(--muted)]">{t('explore.empty')}</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {items.map((doc: DocumentRecord) => (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.id}`}
                  className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-serif text-xl leading-snug group-hover:underline group-hover:underline-offset-4">
                      {doc.title}
                    </span>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                      {doc.category !== null ? (
                        <span className="font-medium text-[var(--foreground)]">{doc.category.name}</span>
                      ) : null}
                      <span className="tabular-nums">
                        {t('documents.engagement.views')} {doc.viewCount}
                      </span>
                      <span className="tabular-nums">
                        {t('documents.engagement.favorites')} {doc.favoriteCount}
                      </span>
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--muted)]">
                    {t('explore.updated')}: {formatUpdatedAt(doc.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
