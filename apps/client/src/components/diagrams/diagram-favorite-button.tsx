'use client';

import { HttpRequestError, isHttpNetworkError } from '@/api/http/execute-request';
import { useToast } from '@/components/providers/toast-provider';
import { useFavoriteDiagramMutation } from '@/features/diagrams/mutations/useDiagramMutation';
import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';
import { useCallback } from 'react';

export interface DiagramFavoriteButtonProps {
  readonly diagramId: string;
  readonly favoriteCount: number;
}

export function DiagramFavoriteButton({
  diagramId,
  favoriteCount,
}: DiagramFavoriteButtonProps): ReactNode {
  const { t } = useTranslations();
  const { showSuccess, showError } = useToast();
  const { mutateAsync, isPending } = useFavoriteDiagramMutation();

  const handleClick = useCallback(async (): Promise<void> => {
    try {
      await mutateAsync(diagramId);
      showSuccess(t('toast.diagramFavoriteAdded'));
    } catch (error: unknown) {
      if (error instanceof HttpRequestError && error.status === 409) {
        showError(t('toast.diagramFavoriteDuplicate'));
        return;
      }
      const msg: string = isHttpNetworkError(error)
        ? t('errors.network')
        : error instanceof Error && error.message.length > 0
          ? error.message
          : t('toast.diagramFavoriteFailed');
      showError(msg);
    }
  }, [diagramId, mutateAsync, showError, showSuccess, t]);

  const countLabel: string = t('diagram.editor.favoriteCount').replace(
    '{{count}}',
    String(favoriteCount),
  );

  return (
    <button
      type="button"
      onClick={(): void => {
        void handleClick();
      }}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 disabled:opacity-60 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60"
      title={countLabel}
    >
      <span aria-hidden>★</span>
      <span>
        {isPending ? t('diagram.editor.favoriting') : t('diagram.editor.favorite')}
      </span>
      <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-xs font-semibold dark:bg-amber-900/40">
        {favoriteCount}
      </span>
    </button>
  );
}
