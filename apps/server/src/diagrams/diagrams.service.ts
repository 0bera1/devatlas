import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Visibility } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { PublicSearchDiagramHit } from '../documents/interfaces/public-search-hit.interface';
import { buildSearchPreview, SEARCH_PREVIEW_MAX_CHARS } from '../documents/utils/search-preview';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../users/interfaces/user-repository.interface';
import {
  USER_ACTIVITY_SERVICE,
  type IUserActivityService,
} from '../user-activity/interfaces/user-activity-service.interface';
import {
  RELATED_DIAGRAMS_LIMIT,
  SEARCH_DIAGRAMS_LIMIT,
} from './constants/search.constants';
import type { DiagramCollaboratorEntry } from './interfaces/diagram-collaborator-entry.interface';
import type {
  DiagramRecord,
  DiagramViewerAccess,
} from './interfaces/diagram-record.interface';
import {
  DIAGRAM_REPOSITORY,
  type IDiagramRepository,
  type SaveDiagramGraphInputEdge,
  type SaveDiagramGraphInputNode,
} from './interfaces/diagram-repository.interface';
import type { DiagramSummary } from './interfaces/diagram-summary.interface';
import type {
  CreateDiagramCommand,
  IDiagramsService,
  SaveDiagramGraphCommand,
} from './interfaces/diagrams-service.interface';

@Injectable()
export class DiagramsService implements IDiagramsService {
  public constructor(
    @Inject(DIAGRAM_REPOSITORY)
    private readonly diagramRepository: IDiagramRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_ACTIVITY_SERVICE)
    private readonly userActivityService: IUserActivityService,
  ) {}

  public async createDiagram(
    ownerId: string,
    command: CreateDiagramCommand,
  ): Promise<DiagramRecord> {
    const created: DiagramRecord = await this.diagramRepository.insertDiagram({
      ownerId,
      title: command.title,
      visibility: command.visibility,
    });

    await this.userActivityService.recordActivity(ownerId);

    return { ...created, viewerAccess: 'owner' };
  }

  public async listDiagramsForUser(userId: string): Promise<DiagramSummary[]> {
    return this.diagramRepository.selectDiagramSummariesForUser(userId);
  }

  public async getDiagram(
    viewerUserId: string,
    diagramId: string,
  ): Promise<DiagramRecord> {
    const diagram: DiagramRecord | null =
      await this.diagramRepository.selectDiagramByIdForUser(
        diagramId,
        viewerUserId,
      );

    if (diagram === null) {
      throw new NotFoundException(`Diagram with id "${diagramId}" not found`);
    }

    const viewerAccess: DiagramViewerAccess =
      await this.resolveViewerAccess(diagram, diagramId, viewerUserId);

    return { ...diagram, viewerAccess };
  }

  public async saveDiagramGraph(
    actorUserId: string,
    diagramId: string,
    command: SaveDiagramGraphCommand,
  ): Promise<DiagramRecord> {
    const nodeIds: Set<string> = new Set<string>();
    for (const n of command.nodes) {
      if (nodeIds.has(n.id)) {
        throw new BadRequestException(`Duplicate node id: ${n.id}`);
      }
      nodeIds.add(n.id);
    }

    const nodes: SaveDiagramGraphInputNode[] = command.nodes.map(
      (n): SaveDiagramGraphInputNode => ({
        id: n.id,
        label: n.label,
        type: n.type,
        x: n.x,
        y: n.y,
        width: n.width ?? null,
        height: n.height ?? null,
        relatedDiagramId:
          n.relatedDiagramId !== undefined &&
          n.relatedDiagramId !== null &&
          String(n.relatedDiagramId).trim().length > 0
            ? String(n.relatedDiagramId).trim()
            : null,
        extras:
          n.extras === undefined || n.extras === null ? null : n.extras,
      }),
    );

    const edges: SaveDiagramGraphInputEdge[] = [];
    for (const e of command.edges) {
      if (!nodeIds.has(e.from)) {
        throw new BadRequestException(
          `Edge references unknown from node: ${e.from}`,
        );
      }
      if (!nodeIds.has(e.to)) {
        throw new BadRequestException(`Edge references unknown to node: ${e.to}`);
      }
      edges.push({
        fromNodeId: e.from,
        toNodeId: e.to,
        label: e.label,
        type: e.type ?? 'smoothstep',
        animated: e.animated ?? false,
      });
    }

    const updated: DiagramRecord | null =
      await this.diagramRepository.replaceDiagramGraph(
        diagramId,
        actorUserId,
        nodes,
        edges,
      );

    if (updated === null) {
      throw new NotFoundException(`Diagram with id "${diagramId}" not found`);
    }

    const viewerAccess: DiagramViewerAccess = await this.resolveViewerAccess(
      updated,
      diagramId,
      actorUserId,
    );

    await this.userActivityService.recordActivity(actorUserId);

    return { ...updated, viewerAccess };
  }

  public async patchDiagram(
    ownerId: string,
    diagramId: string,
    patch: { title?: string; visibility?: Visibility },
  ): Promise<DiagramRecord> {
    if (patch.title === undefined && patch.visibility === undefined) {
      throw new BadRequestException(
        'Provide at least one field: title or visibility.',
      );
    }

    const updated: DiagramRecord | null =
      await this.diagramRepository.updateDiagramPatchByIdAndOwnerId(
        diagramId,
        ownerId,
        patch,
      );

    if (updated === null) {
      throw new NotFoundException(`Diagram with id "${diagramId}" not found`);
    }

    return { ...updated, viewerAccess: 'owner' };
  }

  public async addFavorite(
    userId: string,
    diagramId: string,
  ): Promise<void> {
    const accessible: DiagramRecord | null =
      await this.diagramRepository.selectDiagramByIdForUser(diagramId, userId);

    if (accessible === null) {
      throw new NotFoundException(`Diagram with id "${diagramId}" not found`);
    }

    try {
      await this.diagramRepository.insertDiagramFavorite(userId, diagramId);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Diagram already favorited');
      }
      throw error;
    }
  }

  public async removeDiagram(
    ownerId: string,
    diagramId: string,
  ): Promise<void> {
    const removed: boolean =
      await this.diagramRepository.deleteDiagramByIdAndOwnerId(
        diagramId,
        ownerId,
      );

    if (!removed) {
      throw new NotFoundException(`Diagram with id "${diagramId}" not found`);
    }
  }

  public async searchPublicDiagrams(
    rawQuery: string,
  ): Promise<PublicSearchDiagramHit[]> {
    const trimmed: string = rawQuery.trim();
    if (trimmed.length === 0) {
      return [];
    }

    const rows = await this.diagramRepository.selectPublicDiagramsByQuery(
      trimmed,
      SEARCH_DIAGRAMS_LIMIT,
    );

    return rows.map(
      (row): PublicSearchDiagramHit => ({
        kind: 'diagram',
        id: row.id,
        title: row.title,
        preview: buildSearchPreview(
          row.nodeLabels.join('\n'),
          SEARCH_PREVIEW_MAX_CHARS,
        ),
        ownerId: row.ownerId,
        author: {
          id: row.owner.id,
          name: row.owner.name,
          email: row.owner.email,
        },
        visibility: row.visibility,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  public async getRelatedDiagrams(
    diagramId: string,
    viewerUserId: string | null,
  ): Promise<DiagramSummary[]> {
    const source: DiagramRecord | null =
      viewerUserId === null
        ? await this.diagramRepository.selectDiagramByIdPublicOnly(diagramId)
        : await this.diagramRepository.selectDiagramByIdForUser(
            diagramId,
            viewerUserId,
          );

    if (source === null) {
      throw new NotFoundException(`Diagram with id "${diagramId}" not found`);
    }

    return this.diagramRepository.selectPublicRelatedDiagramsBySharedNodeLabels(
      diagramId,
      RELATED_DIAGRAMS_LIMIT,
    );
  }

  public async addDiagramCollaboratorByEmail(
    ownerId: string,
    diagramId: string,
    email: string,
  ): Promise<DiagramCollaboratorEntry[]> {
    const owned: DiagramRecord | null =
      await this.diagramRepository.selectDiagramByIdAndOwnerId(
        diagramId,
        ownerId,
      );

    if (owned === null) {
      throw new NotFoundException(`Diagram with id "${diagramId}" not found`);
    }

    const invitee = await this.userRepository.findPublicByEmailNormalized(email);

    if (invitee === null) {
      throw new NotFoundException('No user found with that email address.');
    }

    if (invitee.id === owned.ownerId) {
      throw new BadRequestException('The diagram owner is already a member.');
    }

    try {
      await this.diagramRepository.insertDiagramCollaborator(
        diagramId,
        invitee.id,
      );
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('This user is already a collaborator.');
      }
      throw err;
    }

    const list = await this.diagramRepository.selectDiagramCollaborators(diagramId);
    return [...list];
  }

  public async removeDiagramCollaborator(
    ownerId: string,
    diagramId: string,
    targetUserId: string,
  ): Promise<DiagramCollaboratorEntry[]> {
    const owned: DiagramRecord | null =
      await this.diagramRepository.selectDiagramByIdAndOwnerId(
        diagramId,
        ownerId,
      );

    if (owned === null) {
      throw new NotFoundException(`Diagram with id "${diagramId}" not found`);
    }

    const removed: boolean =
      await this.diagramRepository.deleteDiagramCollaborator(
        diagramId,
        targetUserId,
      );

    if (!removed) {
      throw new NotFoundException('Collaborator not found on this diagram.');
    }

    const list = await this.diagramRepository.selectDiagramCollaborators(diagramId);
    return [...list];
  }

  public async listDiagramCollaborators(
    ownerId: string,
    diagramId: string,
  ): Promise<readonly DiagramCollaboratorEntry[]> {
    const owned: DiagramRecord | null =
      await this.diagramRepository.selectDiagramByIdAndOwnerId(
        diagramId,
        ownerId,
      );

    if (owned === null) {
      throw new NotFoundException(`Diagram with id "${diagramId}" not found`);
    }

    return this.diagramRepository.selectDiagramCollaborators(diagramId);
  }

  private async resolveViewerAccess(
    diagram: DiagramRecord,
    diagramId: string,
    viewerUserId: string,
  ): Promise<DiagramViewerAccess> {
    if (diagram.ownerId === viewerUserId) {
      return 'owner';
    }
    const isCollab: boolean =
      await this.diagramRepository.selectIsDiagramCollaborator(
        diagramId,
        viewerUserId,
      );
    if (isCollab) {
      return 'collaborator';
    }
    return 'viewer';
  }
}
