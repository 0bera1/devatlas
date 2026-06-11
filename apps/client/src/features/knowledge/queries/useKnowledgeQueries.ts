'use client';

import { useInfiniteQuery, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { knowledgeApi } from '@/api/knowledge/knowledgeApi';
import { knowledgeQueryKeys } from '@/api/query/knowledge-query-keys';
import type {
  InterviewPrepCategory,
  InterviewPrepCategorySummary,
  InterviewPrepDifficulty,
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

export function useKnowledgeDocumentsInfiniteQuery(search: string) {
  const trimmedSearch: string = search.trim();
  return useInfiniteQuery({
    queryKey: knowledgeQueryKeys.documents(trimmedSearch),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      knowledgeApi.listDocuments(pageParam, trimmedSearch),
    initialPageParam: 1,
    getNextPageParam: getKnowledgeNextPage,
  });
}

export function useKnowledgeDocumentQuery(
  slug: string,
  enabled: boolean,
): UseQueryResult<KnowledgeDocumentRecord, Error> {
  const { locale } = useTranslations();
  return useQuery({
    queryKey: knowledgeQueryKeys.document(slug, locale),
    queryFn: (): Promise<KnowledgeDocumentRecord> =>
      knowledgeApi.getDocument(slug, locale),
    enabled: enabled && slug.length > 0,
  });
}

export function useKnowledgeDiagramsInfiniteQuery(search: string) {
  const { locale } = useTranslations();
  const trimmedSearch: string = search.trim();
  return useInfiniteQuery({
    queryKey: knowledgeQueryKeys.diagrams(locale, trimmedSearch),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      knowledgeApi.listDiagrams(locale, pageParam, trimmedSearch),
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

export function useKnowledgeFlowsInfiniteQuery(search: string) {
  const { locale } = useTranslations();
  const trimmedSearch: string = search.trim();
  return useInfiniteQuery({
    queryKey: knowledgeQueryKeys.flows(locale, trimmedSearch),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      knowledgeApi.listFlows(locale, pageParam, trimmedSearch),
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
  difficulty: InterviewPrepDifficulty | null,
  search: string,
) {
  const { locale } = useTranslations();
  const categoryKey: InterviewPrepCategory | 'all' = category ?? 'all';
  const difficultyKey: InterviewPrepDifficulty | 'all' = difficulty ?? 'all';
  const trimmedSearch: string = search.trim();
  return useInfiniteQuery({
    queryKey: knowledgeQueryKeys.interviewQuestions(
      locale,
      categoryKey,
      difficultyKey,
      trimmedSearch,
    ),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      knowledgeApi.listInterviewQuestions(
        locale,
        category,
        difficulty,
        pageParam,
        trimmedSearch,
      ),
    initialPageParam: 1,
    getNextPageParam: getKnowledgeNextPage,
  });
}

export function useInterviewPrepQuestionQuery(
  slug: string,
  enabled: boolean,
): UseQueryResult<InterviewPrepQuestionDetail, Error> {
  const { locale } = useTranslations();
  return useQuery({
    queryKey: knowledgeQueryKeys.interviewQuestion(slug, locale),
    queryFn: (): Promise<InterviewPrepQuestionDetail> =>
      knowledgeApi.getInterviewQuestion(slug, locale),
    enabled: enabled && slug.length > 0,
  });
}
