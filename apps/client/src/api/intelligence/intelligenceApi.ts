import { IntelligenceMethods } from '@/api/MethodNames';
import { apiClient } from '@/api/http/api-client';
import { buildIntelligencePath } from '@/api/http/execute-request';
import type {
  AutoTagRequestPayload,
  AutoTagResponse,
  DiagramIntelligenceResource,
  GenerateDiagramRequestPayload,
  GeneratedDiagramTemplate,
  RelatedInterviewQuestionsResource,
} from '@/domains/intelligence/intelligenceDomains';

export const intelligenceApi = {
  async getDiagramResources(
    diagramId: string,
    accessToken: string | null | undefined,
  ): Promise<DiagramIntelligenceResource> {
    const response = await apiClient.get<DiagramIntelligenceResource>(
      buildIntelligencePath(IntelligenceMethods.GetDiagramResources, {
        diagramId,
      }),
      { accessToken: accessToken ?? undefined },
    );
    return response.data;
  },

  async getAutoTags(
    payload: AutoTagRequestPayload,
    accessToken: string | null | undefined,
  ): Promise<AutoTagResponse> {
    const response = await apiClient.post<AutoTagResponse>(
      buildIntelligencePath(IntelligenceMethods.GetAutoTags),
      { accessToken: accessToken ?? undefined, body: payload },
    );
    return response.data;
  },

  async generateDiagramFromPrompt(
    payload: GenerateDiagramRequestPayload,
    accessToken: string,
  ): Promise<GeneratedDiagramTemplate> {
    const response = await apiClient.post<GeneratedDiagramTemplate>(
      buildIntelligencePath(IntelligenceMethods.GenerateDiagram),
      { accessToken, body: payload },
    );
    return response.data;
  },

  async getDocumentInterviewQuestions(
    documentId: string,
    accessToken: string | null | undefined,
  ): Promise<RelatedInterviewQuestionsResource> {
    const response = await apiClient.get<RelatedInterviewQuestionsResource>(
      buildIntelligencePath(
        IntelligenceMethods.GetDocumentInterviewQuestions,
        { documentId },
      ),
      { accessToken: accessToken ?? undefined },
    );
    return response.data;
  },
} as const;
