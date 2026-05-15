import { executeJsonRequest } from '@/api/http/execute-request';
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
    return executeJsonRequest<KnowledgeDocumentSummary[]>({
      method: 'GET',
      path: '/knowledge/documents',
    });
  },

  async getDocument(slug: string): Promise<KnowledgeDocumentRecord> {
    return executeJsonRequest<KnowledgeDocumentRecord>({
      method: 'GET',
      path: `/knowledge/documents/${encodeURIComponent(slug)}`,
    });
  },

  async listDiagrams(locale: Locale): Promise<KnowledgeDiagramSummary[]> {
    return executeJsonRequest<KnowledgeDiagramSummary[]>({
      method: 'GET',
      path: '/knowledge/diagrams',
      extraHeaders: knowledgeLocaleHeaders(locale),
    });
  },

  async getDiagram(slug: string, locale: Locale): Promise<KnowledgeDiagramRecord> {
    return executeJsonRequest<KnowledgeDiagramRecord>({
      method: 'GET',
      path: `/knowledge/diagrams/${encodeURIComponent(slug)}`,
      extraHeaders: knowledgeLocaleHeaders(locale),
    });
  },

  async listFlows(locale: Locale): Promise<KnowledgeFlowSummary[]> {
    return executeJsonRequest<KnowledgeFlowSummary[]>({
      method: 'GET',
      path: '/knowledge/flows',
      extraHeaders: knowledgeLocaleHeaders(locale),
    });
  },

  async getFlow(slug: string, locale: Locale): Promise<KnowledgeFlowRecord> {
    return executeJsonRequest<KnowledgeFlowRecord>({
      method: 'GET',
      path: `/knowledge/flows/${encodeURIComponent(slug)}`,
      extraHeaders: knowledgeLocaleHeaders(locale),
    });
  },
};
