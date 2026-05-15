import { executeJsonRequest } from '@/api/http/execute-request';
import type {
  KnowledgeDiagramRecord,
  KnowledgeDiagramSummary,
  KnowledgeDocumentRecord,
  KnowledgeDocumentSummary,
  KnowledgeFlowRecord,
  KnowledgeFlowSummary,
} from '@/domains/knowledge/knowledgeDomains';

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

  async listDiagrams(): Promise<KnowledgeDiagramSummary[]> {
    return executeJsonRequest<KnowledgeDiagramSummary[]>({
      method: 'GET',
      path: '/knowledge/diagrams',
    });
  },

  async getDiagram(slug: string): Promise<KnowledgeDiagramRecord> {
    return executeJsonRequest<KnowledgeDiagramRecord>({
      method: 'GET',
      path: `/knowledge/diagrams/${encodeURIComponent(slug)}`,
    });
  },

  async listFlows(): Promise<KnowledgeFlowSummary[]> {
    return executeJsonRequest<KnowledgeFlowSummary[]>({
      method: 'GET',
      path: '/knowledge/flows',
    });
  },

  async getFlow(slug: string): Promise<KnowledgeFlowRecord> {
    return executeJsonRequest<KnowledgeFlowRecord>({
      method: 'GET',
      path: `/knowledge/flows/${encodeURIComponent(slug)}`,
    });
  },
};
