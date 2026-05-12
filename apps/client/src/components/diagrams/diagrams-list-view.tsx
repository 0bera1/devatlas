'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useCreateDiagramMutation } from '@/features/diagrams/mutations/useDiagramMutation';
import { useDiagramsListQuery } from '@/features/diagrams/queries/useDiagram';
import { useFormatDocumentDate } from '@/hooks/use-format-document-date';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTranslations } from '@/hooks/use-translations';
import type { DocumentVisibility } from '@/domains/documentsDomains';
import type { DiagramSummary } from '@/domains/diagramDomains';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

export function DiagramsListView(): ReactNode {
  const { t } = useTranslations();
  const formatUpdatedAt = useFormatDocumentDate();
  const router = useRouter();
  const { canRender } = useRequireAuth();

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useDiagramsListQuery(canRender);

  const {
    mutateAsync: createDiagram,
    isPending: createPending,
    isError: createIsError,
    error: createErrorRaw,
  } = useCreateDiagramMutation();

  const [newTitle, setNewTitle] = useState<string>('');
  const [newVisibility, setNewVisibility] =
    useState<DocumentVisibility>('PRIVATE');

  const listError = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const createError = useMemo((): string | null => {
    if (!createIsError || createErrorRaw === null) {
      return null;
    }
    return isHttpNetworkError(createErrorRaw)
      ? t('errors.network')
      : createErrorRaw.message;
  }, [createIsError, createErrorRaw, t]);

  const onCreate = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      const trimmed: string = newTitle.trim();
      if (trimmed.length === 0) {
        return;
      }
      try {
        const d = await createDiagram({
          title: trimmed,
          visibility: newVisibility,
        });
        setNewTitle('');
        router.push(`/diagrams/${d.id}`);
      } catch {
        /* toast optional */
      }
    },
    [createDiagram, newTitle, newVisibility, router],
  );

  if (!canRender) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-zinc-500 dark:text-zinc-400">
        {t('common.loading')}
      </main>
    );
  }

  const items: DiagramSummary[] = data ?? [];

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-10 lg:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {t('diagrams.list.title')}
        </h1>
        <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          {t('diagrams.list.intro')}
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('diagrams.list.newDiagram')}
        </h2>
        <form
          className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            void onCreate(e);
          }}
        >
          <label className="block min-w-0 flex-1">
            <span className="sr-only">{t('diagrams.list.titleLabel')}</span>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
              }}
              placeholder={t('diagrams.list.titlePlaceholder')}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block shrink-0 sm:w-40">
            <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {t('diagrams.list.visibilityLabel')}
            </span>
            <select
              value={newVisibility}
              onChange={(e) => {
                setNewVisibility(e.target.value as DocumentVisibility);
              }}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="PRIVATE">{t('documents.visibilityPrivate')}</option>
              <option value="PUBLIC">{t('documents.visibilityPublic')}</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={createPending || newTitle.trim().length === 0}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {createPending ? t('diagrams.list.creating') : t('diagrams.list.create')}
          </button>
        </form>
        {createError !== null ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{createError}</p>
        ) : null}
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            void refetch();
          }}
          disabled={isPending}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
        >
          {t('documents.list.refresh')}
        </button>
      </div>

      {listError !== null ? (
        <p className="text-sm text-red-600 dark:text-red-400">{listError}</p>
      ) : null}

      {isPending && data === undefined ? (
        <p className="text-sm text-zinc-500">{t('diagrams.list.loading')}</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700">
          {t('diagrams.list.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((d: DiagramSummary) => (
            <li key={d.id}>
              <Link
                href={`/diagrams/${d.id}`}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-violet-300 hover:bg-violet-50/40 dark:border-zinc-800 dark:hover:border-violet-800 dark:hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-zinc-950 dark:text-zinc-50">
                    {d.title}
                  </span>
                  {d.accessRole === 'collaborator' ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                      {t('diagrams.list.sharedBadge')}
                    </span>
                  ) : null}
                  {d.visibility === 'PUBLIC' ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                      {t('documents.visibilityPublic')}
                    </span>
                  ) : null}
                  <span className="ml-0 text-xs text-zinc-500 sm:ml-2">
                    {d.nodeCount} {t('diagrams.list.nodes')}
                  </span>
                </div>
                <span className="mt-1 text-xs text-zinc-500 sm:mt-0">
                  {t('documents.list.updated')}: {formatUpdatedAt(d.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
