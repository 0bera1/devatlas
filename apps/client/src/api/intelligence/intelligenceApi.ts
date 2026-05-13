import { IntelligenceMethods } from '@/api/MethodNames';
import {
  buildIntelligencePath,
  executeJsonRequest,
  intelligenceHttpVerb,
} from '@/api/http/execute-request';
import type {
  AutoTagRequestPayload,
  AutoTagResponse,
  DiagramIntelligenceResource,
  GenerateDiagramRequestPayload,
  GeneratedDiagramTemplate,
  RelatedInterviewQuestionsResource,
} from '@/domains/intelligenceDomains';

export const intelligenceApi = {
  async getDiagramResources(
    diagramId: string,
    accessToken: string | null | undefined,
  ): Promise<DiagramIntelligenceResource> {
    return executeJsonRequest<DiagramIntelligenceResource>({
      method: intelligenceHttpVerb(IntelligenceMethods.GetDiagramResources),
      path: buildIntelligencePath(IntelligenceMethods.GetDiagramResources, {
        diagramId,
      }),
      accessToken: accessToken ?? undefined,
    });
  },

  async getAutoTags(
    payload: AutoTagRequestPayload,
    accessToken: string | null | undefined,
  ): Promise<AutoTagResponse> {
    return executeJsonRequest<AutoTagResponse>({
      method: intelligenceHttpVerb(IntelligenceMethods.GetAutoTags),
      path: buildIntelligencePath(IntelligenceMethods.GetAutoTags),
      accessToken: accessToken ?? undefined,
      body: payload,
    });
  },

  async generateDiagramFromPrompt(
    payload: GenerateDiagramRequestPayload,
    accessToken: string,
  ): Promise<GeneratedDiagramTemplate> {
    return executeJsonRequest<GeneratedDiagramTemplate>({
      method: intelligenceHttpVerb(IntelligenceMethods.GenerateDiagram),
      path: buildIntelligencePath(IntelligenceMethods.GenerateDiagram),
      accessToken,
      body: payload,
    });
  },

  async getDocumentInterviewQuestions(
    documentId: string,
    accessToken: string | null | undefined,
  ): Promise<RelatedInterviewQuestionsResource> {
    return executeJsonRequest<RelatedInterviewQuestionsResource>({
      method: intelligenceHttpVerb(
        IntelligenceMethods.GetDocumentInterviewQuestions,
      ),
      path: buildIntelligencePath(
        IntelligenceMethods.GetDocumentInterviewQuestions,
        { documentId },
      ),
      accessToken: accessToken ?? undefined,
    });
  },
} as const;
