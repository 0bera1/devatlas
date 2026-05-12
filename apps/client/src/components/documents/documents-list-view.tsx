'use client';

import { DocumentsRoadmap } from '@/components/documents/documents-roadmap';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useDocumentsList } from '@/hooks/use-documents-list';
import { useFormatDocumentDate } from '@/hooks/use-format-document-date';
import { useTranslations } from '@/hooks/use-translations';
import type { DocumentRecord } from '@/types/document';
import Link from 'next/link';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useState } from 'react';

export function DocumentsListView(): ReactNode {
  const { t } = useTranslations();
  const formatUpdatedAt = useFormatDocumentDate();
  const { canRender } = useRequireAuth();
  const {
    status,
    errorMessage,
    data,
    page,
    pageSize,
    searchInput,
    setSearchInput,
    createStatus,
    createError,
    setPage,
    applySearch,
    clearSearch,
    refresh,
    createDocument,
  } = useDocumentsList();

  const [newTitle, setNewTitle] = useState<string>('');

  const onCreateSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      const trimmedTitle: string = newTitle.trim();
      if (trimmedTitle.length === 0) {
        return;
      }
      await createDocument(trimmedTitle);
      setNewTitle('');
    },
    [newTitle, createDocument],
  );

  if (!canRender) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-zinc-500 dark:text-zinc-400">
        {t('common.loading')}
      </main>
    );
  }

  const items: DocumentRecord[] = data?.items ?? [];
  const total: number = data?.total ?? 0;
  const totalPages: number = data?.totalPages ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10 lg:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {t('documents.list.title')}
          </h1>
          <p className="mt-1 max-w-xl text-zinc-600 dark:text-zinc-400">
            {t('documents.list.intro')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            disabled={status === 'loading'}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            {t('documents.list.refresh')}
          </button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(260px,320px)] lg:items-start">
        <div className="flex flex-col gap-8">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t('documents.list.newDoc')}
            </h2>
            <form
              className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={(e) => {
                void onCreateSubmit(e);
              }}
            >
              <label className="block min-w-0 flex-1">
                <span className="sr-only">{t('documents.list.titleLabel')}</span>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                  }}
                  placeholder={t('documents.list.titlePlaceholder')}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </label>
              <button
                type="submit"
                disabled={
                  createStatus === 'loading' || newTitle.trim().length === 0
                }
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {createStatus === 'loading'
                  ? t('documents.list.creating')
                  : t('documents.list.create')}
              </button>
            </form>
            {createError !== null ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {createError}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t('documents.list.searchSection')}
            </h2>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applySearch();
                  }
                }}
                placeholder={t('documents.list.searchPlaceholder')}
                className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    applySearch();
                  }}
                  className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {t('documents.list.search')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearSearch();
                  }}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  {t('documents.list.clear')}
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {t('documents.list.pageSize')}: {pageSize} · {t('documents.list.total')}
              : {total}
            </p>
          </section>

          {status === 'error' && errorMessage !== null ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {errorMessage}
            </p>
          ) : null}

          <section>
            {status === 'loading' && data === null ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t('documents.list.loadingList')}
              </p>
            ) : items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                {t('documents.list.empty')}
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
                        {t('documents.list.updated')}:{' '}
                        {formatUpdatedAt(doc.updatedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={page <= 1 || status === 'loading'}
                  onClick={() => {
                    setPage(page - 1);
                  }}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-800 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200"
                >
                  {t('documents.list.prev')}
                </button>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t('documents.list.page')} {page} / {Math.max(totalPages, 1)}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || status === 'loading'}
                  onClick={() => {
                    setPage(page + 1);
                  }}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-800 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200"
                >
                  {t('documents.list.next')}
                </button>
              </div>
            ) : null}
          </section>
        </div>

        <DocumentsRoadmap />
      </div>
    </main>
  );
}
