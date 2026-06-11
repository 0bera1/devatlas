import { apiClient } from '@/api/http/api-client';
import {
  KNOWLEDGE_LIST_PAGE_SIZE,
  type InterviewPrepCategory,
  type InterviewPrepCategorySummary,
  type InterviewPrepDifficulty,
  type InterviewPrepQuestionDetail,
  type InterviewPrepQuestionSummary,
  type KnowledgeDiagramRecord,
  type KnowledgeDiagramSummary,
  type KnowledgeDocumentRecord,
  type KnowledgeDocumentSummary,
  type KnowledgeFlowRecord,
  type KnowledgeFlowSummary,
  type KnowledgeListQuery,
  type PaginatedKnowledgeList,
} from '@/domains/knowledge/knowledgeDomains';
import type { Locale } from '@/i18n';

function knowledgeLocaleHeaders(locale: Locale): Readonly<Record<string, string>> {
  return { 'Accept-Language': locale };
}

function buildKnowledgeListPath(
  basePath: string,
  query: KnowledgeListQuery,
  extraParams?: Readonly<Record<string, string>>,
): string {
  const params: URLSearchParams = new URLSearchParams();
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));
  if (query.search.length > 0) {
    params.set('q', query.search);
  }
  if (extraParams !== undefined) {
    for (const [key, value] of Object.entries(extraParams)) {
      params.set(key, value);
    }
  }
  return `${basePath}?${params.toString()}`;
}

function defaultKnowledgeListQuery(
  page: number,
  search: string,
): KnowledgeListQuery {
  return {
    page,
    pageSize: KNOWLEDGE_LIST_PAGE_SIZE,
    search,
  };
}

export const knowledgeApi = {
  async listDocuments(
    page: number = 1,
    search: string = '',
  ): Promise<PaginatedKnowledgeList<KnowledgeDocumentSummary>> {
    const response = await apiClient.get<
      PaginatedKnowledgeList<KnowledgeDocumentSummary>
    >(
      buildKnowledgeListPath(
        '/knowledge/documents',
        defaultKnowledgeListQuery(page, search),
      ),
    );
    return response.data;
  },

  async getDocument(
    slug: string,
    locale: Locale,
  ): Promise<KnowledgeDocumentRecord> {
    const response = await apiClient.get<KnowledgeDocumentRecord>(
      `/knowledge/documents/${encodeURIComponent(slug)}`,
      { headers: knowledgeLocaleHeaders(locale) },
    );
    return response.data;
  },

  async listDiagrams(
    locale: Locale,
    page: number = 1,
    search: string = '',
  ): Promise<PaginatedKnowledgeList<KnowledgeDiagramSummary>> {
    const response = await apiClient.get<
      PaginatedKnowledgeList<KnowledgeDiagramSummary>
    >(
      buildKnowledgeListPath(
        '/knowledge/diagrams',
        defaultKnowledgeListQuery(page, search),
      ),
      { headers: knowledgeLocaleHeaders(locale) },
    );
    return response.data;
  },

  async getDiagram(slug: string, locale: Locale): Promise<KnowledgeDiagramRecord> {
    const response = await apiClient.get<KnowledgeDiagramRecord>(
      `/knowledge/diagrams/${encodeURIComponent(slug)}`,
      { headers: knowledgeLocaleHeaders(locale) },
    );
    return response.data;
  },

  async listFlows(
    locale: Locale,
    page: number = 1,
    search: string = '',
  ): Promise<PaginatedKnowledgeList<KnowledgeFlowSummary>> {
    const response = await apiClient.get<
      PaginatedKnowledgeList<KnowledgeFlowSummary>
    >(
      buildKnowledgeListPath(
        '/knowledge/flows',
        defaultKnowledgeListQuery(page, search),
      ),
      { headers: knowledgeLocaleHeaders(locale) },
    );
    return response.data;
  },

  async getFlow(slug: string, locale: Locale): Promise<KnowledgeFlowRecord> {
    const response = await apiClient.get<KnowledgeFlowRecord>(
      `/knowledge/flows/${encodeURIComponent(slug)}`,
      { headers: knowledgeLocaleHeaders(locale) },
    );
    return response.data;
  },

  async listInterviewCategories(): Promise<InterviewPrepCategorySummary[]> {
    const response = await apiClient.get<InterviewPrepCategorySummary[]>(
      '/knowledge/interview/categories',
    );
    return response.data;
  },

  async listInterviewQuestions(
    locale: Locale,
    category: InterviewPrepCategory | null,
    difficulty: InterviewPrepDifficulty | null,
    page: number = 1,
    search: string = '',
  ): Promise<PaginatedKnowledgeList<InterviewPrepQuestionSummary>> {
    const extraParams: Record<string, string> = {};
    if (category !== null) {
      extraParams.category = category;
    }
    if (difficulty !== null) {
      extraParams.difficulty = difficulty;
    }
    const resolvedExtraParams: Readonly<Record<string, string>> | undefined =
      Object.keys(extraParams).length > 0 ? extraParams : undefined;
    const response = await apiClient.get<
      PaginatedKnowledgeList<InterviewPrepQuestionSummary>
    >(
      buildKnowledgeListPath(
        '/knowledge/interview/questions',
        defaultKnowledgeListQuery(page, search),
        resolvedExtraParams,
      ),
      { headers: knowledgeLocaleHeaders(locale) },
    );
    return response.data;
  },

  async getInterviewQuestion(
    slug: string,
    locale: Locale,
  ): Promise<InterviewPrepQuestionDetail> {
    const response = await apiClient.get<InterviewPrepQuestionDetail>(
      `/knowledge/interview/questions/${encodeURIComponent(slug)}`,
      { headers: knowledgeLocaleHeaders(locale) },
    );
    return response.data;
  },
};
