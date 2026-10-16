'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { DiagramsListRow } from '@/components/diagrams/diagrams-list-row';
import { GenerateDiagramForm } from '@/components/diagrams/generate/generate-diagram-form';
import { useCreateDiagramMutation } from '@/features/diagrams/mutations/useDiagramMutation';
import { useDiagramsListQuery } from '@/features/diagrams/queries/useDiagram';
import { useRequireAuth } from '@/hooks/auth/use-require-auth';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { DocumentVisibility } from '@/domains/documents/documentsDomains';
import type { DiagramSummary } from '@/domains/diagram/diagramDomains';
import { useRouter } from 'next/navigation';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

export function DiagramsListView(): ReactNode {
  const { t } = useTranslations();
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
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-[var(--muted)]">
        {t('common.loading')}
      </div>
    );
  }

  const items: DiagramSummary[] = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-10 lg:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          {t('diagrams.list.title')}
        </h1>
        <p className="max-w-xl text-sm text-[var(--muted)]">
          {t('diagrams.list.intro')}
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
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
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block shrink-0 sm:w-40">
            <span className="mb-1 block text-xs font-medium text-[var(--muted)]">
              {t('diagrams.list.visibilityLabel')}
            </span>
            <select
              value={newVisibility}
              onChange={(e) => {
                setNewVisibility(e.target.value as DocumentVisibility);
              }}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="PRIVATE">{t('documents.visibilityPrivate')}</option>
              <option value="PUBLIC">{t('documents.visibilityPublic')}</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={createPending || newTitle.trim().length === 0}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-400"
          >
            {createPending ? t('diagrams.list.creating') : t('diagrams.list.create')}
          </button>
        </form>
        {createError !== null ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{createError}</p>
        ) : null}
      </section>

      <GenerateDiagramForm />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            void refetch();
          }}
          disabled={isPending}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
        >
          {t('documents.list.refresh')}
        </button>
      </div>

      {listError !== null ? (
        <p className="text-sm text-red-600 dark:text-red-400">{listError}</p>
      ) : null}

      {isPending && data === undefined ? (
        <p className="text-sm text-[var(--muted)]">{t('diagrams.list.loading')}</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          {t('diagrams.list.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((d: DiagramSummary) => (
            <li key={d.id}>
              <DiagramsListRow diagram={d} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
