'use client';

import { isHttpNetworkError, isNotFoundHttpError } from '@/api/http/execute-request';
import { DocumentsListSkeleton } from '@/components/documents/documents-list-skeleton';
import { DocumentsRoadmap } from '@/components/documents/documents-roadmap';
import { useToast } from '@/components/providers/toast-provider';
import {
  useCreateDocumentMutation,
} from '@/features/documents/mutations/useDocumentMutation';
import { useDocumentsListQuery } from '@/features/documents/queries/useDocument';
import { useFormatDocumentDate } from '@/hooks/use-format-document-date';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTranslations } from '@/hooks/use-translations';
import type { DocumentRecord, DocumentVisibility } from '@/domains/documentsDomains';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

export function DocumentsListView(): ReactNode {
  const { t } = useTranslations();
  const formatUpdatedAt = useFormatDocumentDate();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { canRender } = useRequireAuth();

  const [page, setPageState] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [appliedQ, setAppliedQ] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newVisibility, setNewVisibility] = useState<DocumentVisibility>('PRIVATE');

  const listQuery = useMemo(
    () => ({
      page,
      pageSize,
      q: appliedQ,
    }),
    [page, pageSize, appliedQ],
  );

  const {
    data,
    isPending: listPending,
    isError: listIsError,
    error: listError,
    refetch,
  } = useDocumentsListQuery(listQuery, canRender);

  const {
    mutateAsync: createDocuments,
    isPending: createPending,
    isError: createIsError,
    error: createErrorRaw,
    reset: resetCreate,
  } = useCreateDocumentMutation();

  const listErrorMessage = useMemo((): string | null => {
    if (!listIsError || listError === null) {
      return null;
    }
    return isHttpNetworkError(listError)
      ? t('errors.network')
      : listError.message;
  }, [listIsError, listError, t]);

  const createErrorMessage = useMemo((): string | null => {
    if (!createIsError || createErrorRaw === null) {
      return null;
    }
    return isHttpNetworkError(createErrorRaw)
      ? t('errors.network')
      : createErrorRaw.message;
  }, [createIsError, createErrorRaw, t]);

  const applySearch = useCallback(() => {
    const trimmed: string = searchInput.trim();
    setAppliedQ(trimmed.length > 0 ? trimmed : null);
    setPageState(1);
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setAppliedQ(null);
    setPageState(1);
  }, []);

  const onCreateSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      const trimmedTitle: string = newTitle.trim();
      if (trimmedTitle.length === 0) {
        return;
      }
      resetCreate();
      try {
        const doc: DocumentRecord = await createDocuments({
          title: trimmedTitle,
          visibility: newVisibility,
        });
        setNewTitle('');
        setNewVisibility('PRIVATE');
        showSuccess(t('toast.documentCreated'));
        router.push(`/documents/${doc.id}`);
      } catch (err: unknown) {
        if (isHttpNetworkError(err)) {
          showError(t('errors.network'));
        } else if (err instanceof Error) {
          showError(err.message);
        }
      }
    },
    [createDocuments, newTitle, newVisibility, resetCreate, router, showError, showSuccess, t],
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
  const listLoading: boolean = listPending && data === undefined;
  const isTrulyEmpty: boolean =
    !listLoading &&
    items.length === 0 &&
    appliedQ === null &&
    total === 0 &&
    !listIsError;
  const isSearchEmpty: boolean =
    !listLoading && items.length === 0 && appliedQ !== null && !listIsError;

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
              void refetch();
            }}
            disabled={listPending}
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
              className="mt-3 flex flex-col gap-3"
              onSubmit={(e) => {
                void onCreateSubmit(e);
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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
                <label className="block shrink-0 sm:w-44">
                  <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {t('documents.list.visibilityLabel')}
                  </span>
                  <select
                    value={newVisibility}
                    onChange={(e) => {
                      setNewVisibility(e.target.value as DocumentVisibility);
                    }}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                  >
                    <option value="PRIVATE">
                      {t('documents.visibilityPrivate')}
                    </option>
                    <option value="PUBLIC">
                      {t('documents.visibilityPublic')}
                    </option>
                  </select>
                </label>
                <button
                  type="submit"
                  disabled={createPending || newTitle.trim().length === 0}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {createPending
                    ? t('documents.list.creating')
                    : t('documents.list.create')}
                </button>
              </div>
            </form>
            {createErrorMessage !== null ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {createErrorMessage}
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

          {listErrorMessage !== null ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {listErrorMessage}
            </p>
          ) : null}

          <section>
            {listLoading ? (
              <DocumentsListSkeleton />
            ) : isTrulyEmpty ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-950/30">
                <p className="font-sans text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {t('documents.list.emptyTitle')}
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                  {t('documents.list.emptySubtitle')}
                </p>
              </div>
            ) : isSearchEmpty ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t('documents.list.emptySearch')}
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {items.map((doc: DocumentRecord) => (
                  <li key={doc.id}>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="flex flex-col rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <span className="font-medium text-zinc-950 dark:text-zinc-50">
                          {doc.title}
                        </span>
                        <span
                          className={
                            doc.visibility === 'PUBLIC'
                              ? 'shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
                              : 'shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100'
                          }
                        >
                          {doc.visibility === 'PUBLIC'
                            ? t('documents.visibilityPublic')
                            : t('documents.visibilityPrivate')}
                        </span>
                      </div>
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
                  disabled={page <= 1 || listPending}
                  onClick={() => {
                    setPageState(page - 1);
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
                  disabled={page >= totalPages || listPending}
                  onClick={() => {
                    setPageState(page + 1);
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
