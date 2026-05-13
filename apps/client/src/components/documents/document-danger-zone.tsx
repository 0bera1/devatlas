'use client';

import { useDeleteDocumentMutation } from '@/features/documents/mutations/useDocumentMutation';
import { useConfirmDelete } from '@/hooks/use-confirm-delete';
import { useTranslations } from '@/hooks/use-translations';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface DocumentDangerZoneProps {
  readonly documentId: string;
  readonly documentTitle: string;
}

export function DocumentDangerZone(props: DocumentDangerZoneProps): ReactNode {
  const { documentId, documentTitle } = props;
  const { t } = useTranslations();
  const router = useRouter();

  const { mutateAsync: deleteAsync, isPending: deletePending } =
    useDeleteDocumentMutation();

  const { requestDelete } = useConfirmDelete({
    entityTitle: documentTitle,
    confirmMessageTemplate: t('documents.editor.deleteConfirm'),
    successMessage: t('toast.documentDeleted'),
    failureMessage: t('toast.documentDeleteFailed'),
    deleteAsync: async (): Promise<void> => {
      await deleteAsync(documentId);
    },
    onAfterDelete: (): void => {
      router.push('/documents');
    },
  });

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/70 p-4 shadow-sm dark:border-red-900/60 dark:bg-red-950/20">
      <h2 className="text-sm font-semibold text-red-800 dark:text-red-300">
        {t('documents.editor.dangerZoneTitle')}
      </h2>
      <p className="mt-1 text-xs text-red-700 dark:text-red-300/80">
        {t('documents.editor.dangerZoneIntro')}
      </p>
      <button
        type="button"
        disabled={deletePending}
        onClick={() => {
          void requestDelete();
        }}
        className="mt-3 w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/60"
      >
        {deletePending
          ? t('documents.editor.deleting')
          : t('documents.editor.deleteAction')}
      </button>
    </section>
  );
}
