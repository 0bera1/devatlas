'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useToast } from '@/components/providers/toast-provider';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useCallback } from 'react';

export interface ConfirmDeleteOptions {
  readonly entityTitle: string;
  readonly confirmMessageTemplate: string;
  readonly successMessage: string;
  readonly failureMessage: string;
  readonly deleteAsync: () => Promise<void>;
  readonly onAfterDelete?: () => void;
}

export interface ConfirmDeleteHandle {
  readonly requestDelete: () => Promise<void>;
}

/**
 * Tek bir "sil → onayla → API çağrısı → toast" akışını tek yerde tutar.
 * Toast ve i18n için `useToast` + `useTranslations` ile entegredir.
 */
export function useConfirmDelete(options: ConfirmDeleteOptions): ConfirmDeleteHandle {
  const { showSuccess, showError } = useToast();
  const { t } = useTranslations();

  const requestDelete = useCallback(async (): Promise<void> => {
    const message: string = options.confirmMessageTemplate.replace(
      '{{title}}',
      options.entityTitle,
    );

    if (typeof window === 'undefined') {
      return;
    }
    const confirmed: boolean = window.confirm(message);
    if (!confirmed) {
      return;
    }

    try {
      await options.deleteAsync();
      showSuccess(options.successMessage);
      options.onAfterDelete?.();
    } catch (err: unknown) {
      const msg: string = isHttpNetworkError(err)
        ? t('errors.network')
        : err instanceof Error && err.message.length > 0
          ? err.message
          : options.failureMessage;
      showError(msg);
    }
  }, [options, showError, showSuccess, t]);

  return { requestDelete };
}
