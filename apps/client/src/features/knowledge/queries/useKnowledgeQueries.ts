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
  return useQuery({
    queryKey: knowledgeQueryKeys.diagrams(),
    queryFn: (): Promise<KnowledgeDiagramSummary[]> =>
      knowledgeApi.listDiagrams(),
  });
}

export function useKnowledgeDiagramQuery(
  slug: string,
  enabled: boolean,
): UseQueryResult<KnowledgeDiagramRecord, Error> {
  return useQuery({
    queryKey: knowledgeQueryKeys.diagram(slug),
    queryFn: (): Promise<KnowledgeDiagramRecord> =>
      knowledgeApi.getDiagram(slug),
    enabled: enabled && slug.length > 0,
  });
}

export function useKnowledgeFlowsQuery(): UseQueryResult<
  KnowledgeFlowSummary[],
  Error
> {
  return useQuery({
    queryKey: knowledgeQueryKeys.flows(),
    queryFn: (): Promise<KnowledgeFlowSummary[]> => knowledgeApi.listFlows(),
  });
}

export function useKnowledgeFlowQuery(
  slug: string,
  enabled: boolean,
): UseQueryResult<KnowledgeFlowRecord, Error> {
  return useQuery({
    queryKey: knowledgeQueryKeys.flow(slug),
    queryFn: (): Promise<KnowledgeFlowRecord> => knowledgeApi.getFlow(slug),
    enabled: enabled && slug.length > 0,
  });
}
