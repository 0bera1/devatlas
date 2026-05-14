import { DiagramMethods } from '@/api/MethodNames';
import {
  buildDiagramPath,
  diagramHttpVerb,
  executeJsonRequest,
} from '@/api/http/execute-request';
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
    return executeJsonRequest<DiagramSummary[]>({
      method: diagramHttpVerb(DiagramMethods.List),
      path: buildDiagramPath(DiagramMethods.List),
      accessToken,
    });
  },

  async create(
    accessToken: string,
    body: CreateDiagramBody,
  ): Promise<DiagramRecord> {
    return executeJsonRequest<DiagramRecord>({
      method: diagramHttpVerb(DiagramMethods.Create),
      path: buildDiagramPath(DiagramMethods.Create),
      accessToken,
      body,
    });
  },

  async getById(
    accessToken: string,
    diagramId: string,
  ): Promise<DiagramRecord> {
    return executeJsonRequest<DiagramRecord>({
      method: diagramHttpVerb(DiagramMethods.GetById),
      path: buildDiagramPath(DiagramMethods.GetById, { id: diagramId }),
      accessToken,
    });
  },

  async saveGraph(
    accessToken: string,
    diagramId: string,
    body: SaveDiagramGraphBody,
  ): Promise<DiagramRecord> {
    return executeJsonRequest<DiagramRecord>({
      method: diagramHttpVerb(DiagramMethods.SaveGraph),
      path: buildDiagramPath(DiagramMethods.SaveGraph, { id: diagramId }),
      accessToken,
      body,
    });
  },

  async patch(
    accessToken: string,
    diagramId: string,
    body: PatchDiagramBody,
  ): Promise<DiagramRecord> {
    return executeJsonRequest<DiagramRecord>({
      method: diagramHttpVerb(DiagramMethods.Patch),
      path: buildDiagramPath(DiagramMethods.Patch, { id: diagramId }),
      accessToken,
      body,
    });
  },

  /**
   * DELETE — {@link DiagramMethods.Delete}
   */
  async remove(accessToken: string, diagramId: string): Promise<void> {
    await executeJsonRequest<void>({
      method: diagramHttpVerb(DiagramMethods.Delete),
      path: buildDiagramPath(DiagramMethods.Delete, { id: diagramId }),
      accessToken,
    });
  },

  async listCollaborators(
    accessToken: string,
    diagramId: string,
  ): Promise<DiagramCollaboratorEntry[]> {
    return executeJsonRequest<DiagramCollaboratorEntry[]>({
      method: diagramHttpVerb(DiagramMethods.ListCollaborators),
      path: buildDiagramPath(DiagramMethods.ListCollaborators, {
        id: diagramId,
      }),
      accessToken,
    });
  },

  async addCollaborator(
    accessToken: string,
    diagramId: string,
    email: string,
  ): Promise<DiagramCollaboratorEntry[]> {
    return executeJsonRequest<DiagramCollaboratorEntry[]>({
      method: diagramHttpVerb(DiagramMethods.AddCollaborator),
      path: buildDiagramPath(DiagramMethods.AddCollaborator, { id: diagramId }),
      accessToken,
      body: { email },
    });
  },

  async removeCollaborator(
    accessToken: string,
    diagramId: string,
    userId: string,
  ): Promise<DiagramCollaboratorEntry[]> {
    return executeJsonRequest<DiagramCollaboratorEntry[]>({
      method: diagramHttpVerb(DiagramMethods.RemoveCollaborator),
      path: buildDiagramPath(DiagramMethods.RemoveCollaborator, {
        id: diagramId,
        userId,
      }),
      accessToken,
    });
  },

  async listRelated(
    diagramId: string,
    accessToken: string | null | undefined,
  ): Promise<DiagramSummary[]> {
    return executeJsonRequest<DiagramSummary[]>({
      method: diagramHttpVerb(DiagramMethods.Related),
      path: buildDiagramPath(DiagramMethods.Related, { id: diagramId }),
      accessToken: accessToken ?? undefined,
    });
  },

  /**
   * POST — {@link DiagramMethods.FavoriteDiagram}. 409 = zaten favorilenmiş.
   */
  async favorite(accessToken: string, diagramId: string): Promise<void> {
    await executeJsonRequest<void>({
      method: diagramHttpVerb(DiagramMethods.FavoriteDiagram),
      path: buildDiagramPath(DiagramMethods.FavoriteDiagram, { id: diagramId }),
      accessToken,
    });
  },
} as const;
