import { apiClient } from '@/api/http/api-client';
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
import type { Locale } from '@/i18n';

function knowledgeLocaleHeaders(locale: Locale): Readonly<Record<string, string>> {
  return { 'Accept-Language': locale };
}

export const knowledgeApi = {
  async listDocuments(): Promise<KnowledgeDocumentSummary[]> {
    const response = await apiClient.get<KnowledgeDocumentSummary[]>(
      '/knowledge/documents',
    );
    return response.data;
  },

  async getDocument(slug: string): Promise<KnowledgeDocumentRecord> {
    const response = await apiClient.get<KnowledgeDocumentRecord>(
      `/knowledge/documents/${encodeURIComponent(slug)}`,
    );
    return response.data;
  },

  async listDiagrams(locale: Locale): Promise<KnowledgeDiagramSummary[]> {
    const response = await apiClient.get<KnowledgeDiagramSummary[]>(
      '/knowledge/diagrams',
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

  async listFlows(locale: Locale): Promise<KnowledgeFlowSummary[]> {
    const response = await apiClient.get<KnowledgeFlowSummary[]>(
      '/knowledge/flows',
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
    category: InterviewPrepCategory | null,
  ): Promise<InterviewPrepQuestionSummary[]> {
    const path: string =
      category === null
        ? '/knowledge/interview/questions'
        : `/knowledge/interview/questions?category=${encodeURIComponent(category)}`;
    const response = await apiClient.get<InterviewPrepQuestionSummary[]>(path);
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
