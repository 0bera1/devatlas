'use client';

import { useDeleteDiagramMutation } from '@/features/diagrams/mutations/useDiagramMutation';
import { useFormatDocumentDate } from '@/hooks/documents/use-format-document-date';
import { useConfirmDelete } from '@/hooks/ui/use-confirm-delete';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { DiagramSummary } from '@/domains/diagram/diagramDomains';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface DiagramsListRowProps {
  readonly diagram: DiagramSummary;
}

export function DiagramsListRow(props: DiagramsListRowProps): ReactNode {
  const { diagram } = props;
  const { t } = useTranslations();
  const formatUpdatedAt = useFormatDocumentDate();

  const { mutateAsync: deleteAsync, isPending: deletePending } =
    useDeleteDiagramMutation();

  const { requestDelete } = useConfirmDelete({
    entityTitle: diagram.title,
    confirmMessageTemplate: t('diagrams.list.deleteConfirm'),
    successMessage: t('toast.diagramDeleted'),
    failureMessage: t('toast.diagramDeleteFailed'),
    deleteAsync: async (): Promise<void> => {
      await deleteAsync(diagram.id);
    },
  });

  const canDelete: boolean = diagram.accessRole === 'owner';

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-violet-800 dark:hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href={`/diagrams/${diagram.id}`}
        className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-zinc-950 dark:text-zinc-50">
            {diagram.title}
          </span>
          {diagram.accessRole === 'collaborator' ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
              {t('diagrams.list.sharedBadge')}
            </span>
          ) : null}
          {diagram.visibility === 'PUBLIC' ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
              {t('documents.visibilityPublic')}
            </span>
          ) : null}
          <span className="ml-0 text-xs text-zinc-500 dark:text-zinc-400 sm:ml-2">
            {diagram.nodeCount} {t('diagrams.list.nodes')}
          </span>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 sm:ml-2">
          {t('documents.list.updated')}: {formatUpdatedAt(diagram.updatedAt)}
        </span>
      </Link>

      {canDelete ? (
        <button
          type="button"
          disabled={deletePending}
          onClick={() => {
            void requestDelete();
          }}
          className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
        >
          {deletePending
            ? t('diagrams.list.deleting')
            : t('diagrams.list.deleteAction')}
        </button>
      ) : null}
    </div>
  );
}
