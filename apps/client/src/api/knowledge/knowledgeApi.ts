import { apiClient } from '@/api/http/api-client';
import type {
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
};
