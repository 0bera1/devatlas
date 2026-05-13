'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import type { RelatedInterviewQuestionsResource } from '@/domains/intelligenceDomains';
import { useDocumentInterviewQuestionsQuery } from '@/features/intelligence/queries/useDocumentInterviewQuestionsQuery';
import { useTranslations } from '@/hooks/use-translations';
import { useMemo } from 'react';

export type DocumentInterviewQuestionsStatus =
  | 'loading'
  | 'error'
  | 'empty'
  | 'ready';

export interface DocumentInterviewQuestionsState {
  readonly status: DocumentInterviewQuestionsStatus;
  readonly resource: RelatedInterviewQuestionsResource | null;
  readonly errorMessage: string | null;
}

function resolveStatus(
  isPending: boolean,
  isError: boolean,
  resource: RelatedInterviewQuestionsResource | null,
): DocumentInterviewQuestionsStatus {
  if (isPending && resource === null) {
    return 'loading';
  }
  if (isError) {
    return 'error';
  }
  if (resource === null || resource.relatedInterviewQuestions.length === 0) {
    return 'empty';
  }
  return 'ready';
}

/**
 * Doküman bazlı mülakat sorusu önerilerini UI için durum + veri olarak sarmalar.
 */
export function useDocumentInterviewQuestions(
  documentId: string,
  enabled: boolean,
): DocumentInterviewQuestionsState {
  const { t } = useTranslations();
  const { data, isPending, isError, error } =
    useDocumentInterviewQuestionsQuery(documentId, enabled);

  const resource: RelatedInterviewQuestionsResource | null = data ?? null;

  const errorMessage: string | null = useMemo((): string | null => {
    if (!isError || error === null || error === undefined) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const status: DocumentInterviewQuestionsStatus = resolveStatus(
    isPending,
    isError,
    resource,
  );

  return { status, resource, errorMessage };
}
