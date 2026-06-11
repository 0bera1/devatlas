'use client';

import { useInfiniteQuery, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { knowledgeApi } from '@/api/knowledge/knowledgeApi';
import { knowledgeQueryKeys } from '@/api/query/knowledge-query-keys';
import type {
  InterviewPrepCategory,
  InterviewPrepCategorySummary,
  InterviewPrepQuestionDetail,
  InterviewPrepQuestionSummary,
  KnowledgeDiagramRecord,
  KnowledgeDiagramSummary,
  KnowledgeDocumentRecord,
  KnowledgeDocumentSummary,
  KnowledgeFlowRecord,
  KnowledgeFlowSummary,
} from '@/domains/knowledge/knowledgeDomains';
import { getKnowledgeNextPage } from '@/lib/knowledge/flatten-knowledge-pages';
import { useTranslations } from '@/hooks/i18n/use-translations';

export function useKnowledgeDocumentsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: knowledgeQueryKeys.documents(),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      knowledgeApi.listDocuments(pageParam),
    initialPageParam: 1,
    getNextPageParam: getKnowledgeNextPage,
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

export function useKnowledgeDiagramsInfiniteQuery() {
  const { locale } = useTranslations();
  return useInfiniteQuery({
    queryKey: knowledgeQueryKeys.diagrams(locale),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      knowledgeApi.listDiagrams(locale, pageParam),
    initialPageParam: 1,
    getNextPageParam: getKnowledgeNextPage,
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

export function useKnowledgeFlowsInfiniteQuery() {
  const { locale } = useTranslations();
  return useInfiniteQuery({
    queryKey: knowledgeQueryKeys.flows(locale),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      knowledgeApi.listFlows(locale, pageParam),
    initialPageParam: 1,
    getNextPageParam: getKnowledgeNextPage,
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

export function useInterviewPrepCategoriesQuery(): UseQueryResult<
  InterviewPrepCategorySummary[],
  Error
> {
  return useQuery({
    queryKey: knowledgeQueryKeys.interviewCategories(),
    queryFn: (): Promise<InterviewPrepCategorySummary[]> =>
      knowledgeApi.listInterviewCategories(),
  });
}

export function useInterviewPrepQuestionsInfiniteQuery(
  category: InterviewPrepCategory | null,
) {
  const categoryKey: InterviewPrepCategory | 'all' = category ?? 'all';
  return useInfiniteQuery({
    queryKey: knowledgeQueryKeys.interviewQuestions(categoryKey),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      knowledgeApi.listInterviewQuestions(category, pageParam),
    initialPageParam: 1,
    getNextPageParam: getKnowledgeNextPage,
  });
}

export function useInterviewPrepQuestionQuery(
  slug: string,
  enabled: boolean,
): UseQueryResult<InterviewPrepQuestionDetail, Error> {
  return useQuery({
    queryKey: knowledgeQueryKeys.interviewQuestion(slug),
    queryFn: (): Promise<InterviewPrepQuestionDetail> =>
      knowledgeApi.getInterviewQuestion(slug),
    enabled: enabled && slug.length > 0,
  });
}
