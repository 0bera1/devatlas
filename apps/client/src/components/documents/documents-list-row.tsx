'use client';

import { useDeleteDocumentMutation } from '@/features/documents/mutations/useDocumentMutation';
import { useFormatDocumentDate } from '@/hooks/documents/use-format-document-date';
import { useConfirmDelete } from '@/hooks/ui/use-confirm-delete';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { DocumentRecord } from '@/domains/documents/documentsDomains';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface DocumentsListRowProps {
  readonly document: DocumentRecord;
}

export function DocumentsListRow(props: DocumentsListRowProps): ReactNode {
  const { document } = props;
  const { t } = useTranslations();
  const formatUpdatedAt = useFormatDocumentDate();

  const { mutateAsync: deleteAsync, isPending: deletePending } =
    useDeleteDocumentMutation();

  const { requestDelete } = useConfirmDelete({
    entityTitle: document.title,
    confirmMessageTemplate: t('documents.list.deleteConfirm'),
    successMessage: t('toast.documentDeleted'),
    failureMessage: t('toast.documentDeleteFailed'),
    deleteAsync: async (): Promise<void> => {
      await deleteAsync(document.id);
    },
  });

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href={`/documents/${document.id}`}
        className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="font-medium text-zinc-950 dark:text-zinc-50">
            {document.title}
          </span>
          <span
            className={
              document.visibility === 'PUBLIC'
                ? 'shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
                : 'shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100'
            }
          >
            {document.visibility === 'PUBLIC'
              ? t('documents.visibilityPublic')
              : t('documents.visibilityPrivate')}
          </span>
          {document.category !== null ? (
            <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-900 dark:bg-sky-950/50 dark:text-sky-200">
              {document.category.name}
            </span>
          ) : null}
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-right">
          {t('documents.list.updated')}: {formatUpdatedAt(document.updatedAt)}
        </span>
      </Link>

      <button
        type="button"
        disabled={deletePending}
        onClick={() => {
          void requestDelete();
        }}
        className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
      >
        {deletePending
          ? t('documents.list.deleting')
          : t('documents.list.deleteAction')}
      </button>
    </div>
  );
}
