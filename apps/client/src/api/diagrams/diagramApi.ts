import { DiagramMethods } from '@/api/MethodNames';
import { apiClient } from '@/api/http/api-client';
import { buildDiagramPath } from '@/api/http/execute-request';
import type {
  CreateDiagramBody,
  DiagramCollaboratorEntry,
  DiagramRecord,
  DiagramSummary,
  PatchDiagramBody,
  SaveDiagramGraphBody,
} from '@/domains/diagram/diagramDomains';

export const diagramApi = {
  async list(accessToken: string): Promise<DiagramSummary[]> {
    const response = await apiClient.get<DiagramSummary[]>(
      buildDiagramPath(DiagramMethods.List),
      { accessToken },
    );
    return response.data;
  },

  async create(
    accessToken: string,
    body: CreateDiagramBody,
  ): Promise<DiagramRecord> {
    const response = await apiClient.post<DiagramRecord>(
      buildDiagramPath(DiagramMethods.Create),
      { accessToken, body },
    );
    return response.data;
  },

  async getById(
    accessToken: string,
    diagramId: string,
  ): Promise<DiagramRecord> {
    const response = await apiClient.get<DiagramRecord>(
      buildDiagramPath(DiagramMethods.GetById, { id: diagramId }),
      { accessToken },
    );
    return response.data;
  },

  async saveGraph(
    accessToken: string,
    diagramId: string,
    body: SaveDiagramGraphBody,
  ): Promise<DiagramRecord> {
    const response = await apiClient.put<DiagramRecord>(
      buildDiagramPath(DiagramMethods.SaveGraph, { id: diagramId }),
      { accessToken, body },
    );
    return response.data;
  },

  async patch(
    accessToken: string,
    diagramId: string,
    body: PatchDiagramBody,
  ): Promise<DiagramRecord> {
    const response = await apiClient.patch<DiagramRecord>(
      buildDiagramPath(DiagramMethods.Patch, { id: diagramId }),
      { accessToken, body },
    );
    return response.data;
  },

  /**
   * DELETE — {@link DiagramMethods.Delete}
   */
  async remove(accessToken: string, diagramId: string): Promise<void> {
    await apiClient.delete<void>(
      buildDiagramPath(DiagramMethods.Delete, { id: diagramId }),
      { accessToken },
    );
  },

  async listCollaborators(
    accessToken: string,
    diagramId: string,
  ): Promise<DiagramCollaboratorEntry[]> {
    const response = await apiClient.get<DiagramCollaboratorEntry[]>(
      buildDiagramPath(DiagramMethods.ListCollaborators, { id: diagramId }),
      { accessToken },
    );
    return response.data;
  },

  async addCollaborator(
    accessToken: string,
    diagramId: string,
    email: string,
  ): Promise<DiagramCollaboratorEntry[]> {
    const response = await apiClient.post<DiagramCollaboratorEntry[]>(
      buildDiagramPath(DiagramMethods.AddCollaborator, { id: diagramId }),
      { accessToken, body: { email } },
    );
    return response.data;
  },

  async removeCollaborator(
    accessToken: string,
    diagramId: string,
    userId: string,
  ): Promise<DiagramCollaboratorEntry[]> {
    const response = await apiClient.delete<DiagramCollaboratorEntry[]>(
      buildDiagramPath(DiagramMethods.RemoveCollaborator, {
        id: diagramId,
        userId,
      }),
      { accessToken },
    );
    return response.data;
  },

  async listRelated(
    diagramId: string,
    accessToken: string | null | undefined,
  ): Promise<DiagramSummary[]> {
    const response = await apiClient.get<DiagramSummary[]>(
      buildDiagramPath(DiagramMethods.Related, { id: diagramId }),
      { accessToken: accessToken ?? undefined },
    );
    return response.data;
  },

  /**
   * POST — {@link DiagramMethods.FavoriteDiagram}. 409 = zaten favorilenmiş.
   */
  async favorite(accessToken: string, diagramId: string): Promise<void> {
    await apiClient.post<void>(
      buildDiagramPath(DiagramMethods.FavoriteDiagram, { id: diagramId }),
      { accessToken },
    );
  },
} as const;
