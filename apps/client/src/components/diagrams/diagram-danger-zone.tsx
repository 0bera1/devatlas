'use client';

import { useDeleteDiagramMutation } from '@/features/diagrams/mutations/useDiagramMutation';
import { useConfirmDelete } from '@/hooks/ui/use-confirm-delete';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface DiagramDangerZoneProps {
  readonly diagramId: string;
  readonly diagramTitle: string;
}

export function DiagramDangerZone(props: DiagramDangerZoneProps): ReactNode {
  const { diagramId, diagramTitle } = props;
  const { t } = useTranslations();
  const router = useRouter();

  const { mutateAsync: deleteAsync, isPending: deletePending } =
    useDeleteDiagramMutation();

  const { requestDelete } = useConfirmDelete({
    entityTitle: diagramTitle,
    confirmMessageTemplate: t('diagrams.editor.deleteConfirm'),
    successMessage: t('toast.diagramDeleted'),
    failureMessage: t('toast.diagramDeleteFailed'),
    deleteAsync: async (): Promise<void> => {
      await deleteAsync(diagramId);
    },
    onAfterDelete: (): void => {
      router.push('/diagrams');
    },
  });

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/70 p-4 shadow-sm dark:border-red-900/60 dark:bg-red-950/20">
      <h2 className="text-sm font-semibold text-red-800 dark:text-red-300">
        {t('diagrams.editor.dangerZoneTitle')}
      </h2>
      <p className="mt-1 text-xs text-red-700 dark:text-red-300/80">
        {t('diagrams.editor.dangerZoneIntro')}
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
          ? t('diagrams.editor.deleting')
          : t('diagrams.editor.deleteAction')}
      </button>
    </section>
  );
}
