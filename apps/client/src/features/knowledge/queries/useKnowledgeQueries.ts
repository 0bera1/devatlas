'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { knowledgeApi } from '@/api/knowledge/knowledgeApi';
import { knowledgeQueryKeys } from '@/api/query/knowledge-query-keys';
import type {
  KnowledgeDiagramRecord,
  KnowledgeDiagramSummary,
  KnowledgeDocumentRecord,
  KnowledgeDocumentSummary,
  KnowledgeFlowRecord,
  KnowledgeFlowSummary,
} from '@/domains/knowledge/knowledgeDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';

export function useKnowledgeDocumentsQuery(): UseQueryResult<
  KnowledgeDocumentSummary[],
  Error
> {
  return useQuery({
    queryKey: knowledgeQueryKeys.documents(),
    queryFn: (): Promise<KnowledgeDocumentSummary[]> =>
      knowledgeApi.listDocuments(),
  });
}

export function useKnowledgeDocumentQuery(
  slug: string,
  enabled: boolean,
): UseQueryResult<KnowledgeDocumentRecord, Error> {
  return useQuery({
    queryKey: knowledgeQueryKeys.document(slug),
    queryFn: (): Promise<KnowledgeDocumentRecord> =>
      knowledgeApi.getDocument(slug),
    enabled: enabled && slug.length > 0,
  });
}

export function useKnowledgeDiagramsQuery(): UseQueryResult<
  KnowledgeDiagramSummary[],
  Error
> {
  const { locale } = useTranslations();
  return useQuery({
    queryKey: knowledgeQueryKeys.diagrams(locale),
    queryFn: (): Promise<KnowledgeDiagramSummary[]> =>
      knowledgeApi.listDiagrams(locale),
  });
}

export function useKnowledgeDiagramQuery(
  slug: string,
  enabled: boolean,
): UseQueryResult<KnowledgeDiagramRecord, Error> {
  const { locale } = useTranslations();
  return useQuery({
    queryKey: knowledgeQueryKeys.diagram(slug, locale),
    queryFn: (): Promise<KnowledgeDiagramRecord> =>
      knowledgeApi.getDiagram(slug, locale),
    enabled: enabled && slug.length > 0,
  });
}

export function useKnowledgeFlowsQuery(): UseQueryResult<
  KnowledgeFlowSummary[],
  Error
> {
  const { locale } = useTranslations();
  return useQuery({
    queryKey: knowledgeQueryKeys.flows(locale),
    queryFn: (): Promise<KnowledgeFlowSummary[]> =>
      knowledgeApi.listFlows(locale),
  });
}

export function useKnowledgeFlowQuery(
  slug: string,
  enabled: boolean,
): UseQueryResult<KnowledgeFlowRecord, Error> {
  const { locale } = useTranslations();
  return useQuery({
    queryKey: knowledgeQueryKeys.flow(slug, locale),
    queryFn: (): Promise<KnowledgeFlowRecord> =>
      knowledgeApi.getFlow(slug, locale),
    enabled: enabled && slug.length > 0,
  });
}
