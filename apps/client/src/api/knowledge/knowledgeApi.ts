import { apiClient } from '@/api/http/api-client';
import {
  KNOWLEDGE_LIST_PAGE_SIZE,
  type InterviewPrepCategory,
  type InterviewPrepCategorySummary,
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
  if (extraParams !== undefined) {
    for (const [key, value] of Object.entries(extraParams)) {
      params.set(key, value);
    }
  }
  return `${basePath}?${params.toString()}`;
}

function defaultKnowledgeListQuery(page: number): KnowledgeListQuery {
  return {
    page,
    pageSize: KNOWLEDGE_LIST_PAGE_SIZE,
  };
}

export const knowledgeApi = {
  async listDocuments(
    page: number = 1,
  ): Promise<PaginatedKnowledgeList<KnowledgeDocumentSummary>> {
    const response = await apiClient.get<
      PaginatedKnowledgeList<KnowledgeDocumentSummary>
    >(buildKnowledgeListPath('/knowledge/documents', defaultKnowledgeListQuery(page)));
    return response.data;
  },

  async getDocument(slug: string): Promise<KnowledgeDocumentRecord> {
    const response = await apiClient.get<KnowledgeDocumentRecord>(
      `/knowledge/documents/${encodeURIComponent(slug)}`,
    );
    return response.data;
  },

  async listDiagrams(
    locale: Locale,
    page: number = 1,
  ): Promise<PaginatedKnowledgeList<KnowledgeDiagramSummary>> {
    const response = await apiClient.get<
      PaginatedKnowledgeList<KnowledgeDiagramSummary>
    >(buildKnowledgeListPath('/knowledge/diagrams', defaultKnowledgeListQuery(page)), {
      headers: knowledgeLocaleHeaders(locale),
    });
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
  ): Promise<PaginatedKnowledgeList<KnowledgeFlowSummary>> {
    const response = await apiClient.get<
      PaginatedKnowledgeList<KnowledgeFlowSummary>
    >(buildKnowledgeListPath('/knowledge/flows', defaultKnowledgeListQuery(page)), {
      headers: knowledgeLocaleHeaders(locale),
    });
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
    category: InterviewPrepCategory | null,
    page: number = 1,
  ): Promise<PaginatedKnowledgeList<InterviewPrepQuestionSummary>> {
    const extraParams: Readonly<Record<string, string>> | undefined =
      category === null ? undefined : { category };
    const response = await apiClient.get<
      PaginatedKnowledgeList<InterviewPrepQuestionSummary>
    >(
      buildKnowledgeListPath(
        '/knowledge/interview/questions',
        defaultKnowledgeListQuery(page),
        extraParams,
      ),
    );
    return response.data;
  },

  async getInterviewQuestion(
    slug: string,
  ): Promise<InterviewPrepQuestionDetail> {
    const response = await apiClient.get<InterviewPrepQuestionDetail>(
      `/knowledge/interview/questions/${encodeURIComponent(slug)}`,
    );
    return response.data;
  },
};
