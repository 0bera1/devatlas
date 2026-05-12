'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import {
  useAddDiagramCollaboratorMutation,
  useRemoveDiagramCollaboratorMutation,
} from '@/features/diagrams/mutations/useDiagramMutation';
import { useDiagramCollaboratorsQuery } from '@/features/diagrams/queries/useDiagram';
import type { DiagramCollaboratorEntry } from '@/domains/diagramDomains';
import { useTranslations } from '@/hooks/use-translations';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

export interface DiagramCollaboratorsSectionProps {
  readonly diagramId: string;
  readonly enabled: boolean;
}

export function DiagramCollaboratorsSection(
  props: DiagramCollaboratorsSectionProps,
): ReactNode {
  const { diagramId, enabled } = props;
  const { t } = useTranslations();
  const [email, setEmail] = useState<string>('');

  const { data, isPending, isError, error, refetch } =
    useDiagramCollaboratorsQuery(diagramId, enabled);

  const { mutateAsync: addCollaborator, isPending: addPending } =
    useAddDiagramCollaboratorMutation();
  const { mutateAsync: removeCollaborator, isPending: removePending } =
    useRemoveDiagramCollaboratorMutation();

  const listError = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const entries: DiagramCollaboratorEntry[] = data ?? [];

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      const trimmed: string = email.trim();
      if (trimmed.length === 0) {
        return;
      }
      try {
        await addCollaborator({ diagramId, email: trimmed });
        setEmail('');
      } catch {
        /* useToast optional */
      }
    },
    [addCollaborator, diagramId, email],
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {t('diagrams.editor.collaboratorsTitle')}
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {t('diagrams.editor.collaboratorsHint')}
      </p>

      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          void onSubmit(e);
        }}
      >
        <label className="block min-w-0 flex-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {t('diagrams.editor.collaboratorEmail')}
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            autoComplete="off"
            placeholder={t('diagrams.editor.collaboratorEmailPlaceholder')}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <button
          type="submit"
          disabled={addPending || email.trim().length === 0}
          className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 dark:bg-violet-500"
        >
          {addPending
            ? t('diagrams.editor.collaboratorAdding')
            : t('diagrams.editor.collaboratorAdd')}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          void refetch();
        }}
        disabled={isPending}
        className="mt-2 text-xs font-medium text-zinc-600 underline-offset-2 hover:underline disabled:opacity-50 dark:text-zinc-400"
      >
        {t('diagrams.editor.collaboratorsRefresh')}
      </button>

      {listError !== null ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{listError}</p>
      ) : null}

      {isPending && data === undefined ? (
        <ul className="mt-3 flex flex-col gap-2">
          {[0, 1].map((i: number) => (
            <li
              key={i}
              className="h-10 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </ul>
      ) : entries.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {t('diagrams.editor.collaboratorsEmpty')}
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {entries.map((c: DiagramCollaboratorEntry) => (
            <li
              key={c.userId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                  {c.email}
                </div>
                {c.name !== null && c.name.trim().length > 0 ? (
                  <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {c.name}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                disabled={removePending}
                onClick={() => {
                  void removeCollaborator({
                    diagramId,
                    userId: c.userId,
                  });
                }}
                className="shrink-0 rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {t('diagrams.editor.collaboratorRemove')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
