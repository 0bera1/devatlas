'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import type { DiagramIntelligenceResource } from '@/domains/intelligenceDomains';
import { useDiagramIntelligenceQuery } from '@/features/intelligence/queries/useDiagramIntelligenceQuery';
import { useTranslations } from '@/hooks/use-translations';
import { useMemo } from 'react';

export type DiagramIntelligenceStatus = 'loading' | 'error' | 'empty' | 'ready';

export interface DiagramIntelligenceState {
  readonly status: DiagramIntelligenceStatus;
  readonly resource: DiagramIntelligenceResource | null;
  readonly errorMessage: string | null;
}

function hasAnyResource(resource: DiagramIntelligenceResource): boolean {
  return (
    resource.semanticTags.length > 0 ||
    resource.relatedDiagrams.length > 0 ||
    resource.relatedDocuments.length > 0 ||
    resource.relatedInterviewQuestions.length > 0 ||
    resource.similarTechnologies.length > 0
  );
}

function resolveStatus(
  isPending: boolean,
  isError: boolean,
  resource: DiagramIntelligenceResource | null,
): DiagramIntelligenceStatus {
  if (isError) {
    return 'error';
  }
  if (isPending || resource === null) {
    return 'loading';
  }
  if (!hasAnyResource(resource)) {
    return 'empty';
  }
  return 'ready';
}

export function useDiagramIntelligence(
  diagramId: string,
  enabled: boolean,
): DiagramIntelligenceState {
  const { t } = useTranslations();
  const { data, isPending, isError, error } = useDiagramIntelligenceQuery(
    diagramId,
    enabled,
  );

  const resource: DiagramIntelligenceResource | null = data ?? null;

  const errorMessage: string | null = useMemo((): string | null => {
    if (!isError || error === null || error === undefined) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const status: DiagramIntelligenceStatus = resolveStatus(
    isPending,
    isError,
    resource,
  );

  return { status, resource, errorMessage };
}
