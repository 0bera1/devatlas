import { Inject, Injectable } from '@nestjs/common';
import type { Prisma, Visibility } from '@prisma/client';
import { Visibility as VisibilityEnum } from '@prisma/client';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type { DiagramEdgeRecord } from './interfaces/diagram-edge-record.interface';
import type { DiagramNodeRecord } from './interfaces/diagram-node-record.interface';
import type { DiagramRecord } from './interfaces/diagram-record.interface';
import type { DiagramCollaboratorEntry } from './interfaces/diagram-collaborator-entry.interface';
import type {
  CreateDiagramInput,
  IDiagramRepository,
  SaveDiagramGraphInputEdge,
  SaveDiagramGraphInputNode,
} from './interfaces/diagram-repository.interface';
import type { DiagramSearchRow } from './interfaces/diagram-search-row.interface';
import type { DiagramSummary } from './interfaces/diagram-summary.interface';

const diagramFullSelect = {
  id: true,
  title: true,
  ownerId: true,
  visibility: true,
  favoriteCount: true,
  createdAt: true,
  updatedAt: true,
  nodes: {
    orderBy: { id: 'asc' as const },
    select: {
      id: true,
      diagramId: true,
      label: true,
      type: true,
      x: true,
      y: true,
      width: true,
      height: true,
    },
  },
  edges: {
    orderBy: { id: 'asc' as const },
    select: {
      id: true,
      diagramId: true,
      fromNodeId: true,
      toNodeId: true,
      label: true,
      type: true,
      animated: true,
    },
  },
} satisfies Prisma.DiagramSelect;

function mapPrismaDiagramToRecord(
  row: Prisma.DiagramGetPayload<{ select: typeof diagramFullSelect }>,
): DiagramRecord {
  const nodes: DiagramNodeRecord[] = row.nodes.map(
    (n: (typeof row.nodes)[number]): DiagramNodeRecord => ({
      id: n.id,
      diagramId: n.diagramId,
      label: n.label,
      type: n.type,
      x: n.x,
      y: n.y,
      width: n.width,
      height: n.height,
    }),
  );
  const edges: DiagramEdgeRecord[] = row.edges.map(
    (e: (typeof row.edges)[number]): DiagramEdgeRecord => ({
      id: e.id,
      diagramId: e.diagramId,
      fromNodeId: e.fromNodeId,
      toNodeId: e.toNodeId,
      label: e.label,
      type: e.type,
      animated: e.animated,
    }),
  );

  return {
    id: row.id,
    title: row.title,
    ownerId: row.ownerId,
    visibility: row.visibility,
    viewerAccess: 'viewer',
    nodes,
    edges,
    favoriteCount: row.favoriteCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class DiagramRepository implements IDiagramRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async insertDiagram(input: CreateDiagramInput): Promise<DiagramRecord> {
    const row: Prisma.DiagramGetPayload<{ select: typeof diagramFullSelect }> =
      await this.prisma.diagram.create({
        data: {
          title: input.title,
          ownerId: input.ownerId,
          visibility: input.visibility ?? VisibilityEnum.PRIVATE,
        },
        select: diagramFullSelect,
      });
    return mapPrismaDiagramToRecord(row);
  }

  public async selectDiagramSummariesForUser(
    userId: string,
  ): Promise<DiagramSummary[]> {
    const rows = await this.prisma.diagram.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { collaborators: { some: { userId } } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        ownerId: true,
        visibility: true,
        favoriteCount: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { nodes: true } },
      },
    });

    return rows.map(
      (r: (typeof rows)[number]): DiagramSummary => ({
        id: r.id,
        title: r.title,
        ownerId: r.ownerId,
        visibility: r.visibility,
        accessRole: r.ownerId === userId ? 'owner' : 'collaborator',
        nodeCount: r._count.nodes,
        favoriteCount: r.favoriteCount,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }),
    );
  }

  public async selectDiagramByIdAndOwnerId(
    id: string,
    ownerId: string,
  ): Promise<DiagramRecord | null> {
    const row: Prisma.DiagramGetPayload<{
      select: typeof diagramFullSelect;
    }> | null = await this.prisma.diagram.findFirst({
      where: { id, ownerId },
      select: diagramFullSelect,
    });
    return row === null ? null : mapPrismaDiagramToRecord(row);
  }

  public async selectDiagramByIdForUser(
    id: string,
    userId: string,
  ): Promise<DiagramRecord | null> {
    const row: Prisma.DiagramGetPayload<{
      select: typeof diagramFullSelect;
    }> | null = await this.prisma.diagram.findFirst({
      where: {
        id,
        OR: [
          { visibility: VisibilityEnum.PUBLIC },
          { ownerId: userId },
          { collaborators: { some: { userId } } },
        ],
      },
      select: diagramFullSelect,
    });
    return row === null ? null : mapPrismaDiagramToRecord(row);
  }

  public async selectDiagramByIdPublicOnly(
    id: string,
  ): Promise<DiagramRecord | null> {
    const row: Prisma.DiagramGetPayload<{
      select: typeof diagramFullSelect;
    }> | null = await this.prisma.diagram.findFirst({
      where: { id, visibility: VisibilityEnum.PUBLIC },
      select: diagramFullSelect,
    });
    return row === null ? null : mapPrismaDiagramToRecord(row);
  }

  public async selectIsDiagramCollaborator(
    diagramId: string,
    userId: string,
  ): Promise<boolean> {
    const row: { diagramId: string } | null =
      await this.prisma.diagramCollaborator.findUnique({
        where: {
          diagramId_userId: {
            diagramId,
            userId,
          },
        },
        select: { diagramId: true },
      });
    return row !== null;
  }

  public async replaceDiagramGraph(
    diagramId: string,
    actorUserId: string,
    nodes: readonly SaveDiagramGraphInputNode[],
    edges: readonly SaveDiagramGraphInputEdge[],
  ): Promise<DiagramRecord | null> {
    const allowed: { id: string } | null = await this.prisma.diagram.findFirst({
      where: {
        id: diagramId,
        OR: [
          { ownerId: actorUserId },
          { collaborators: { some: { userId: actorUserId } } },
        ],
      },
      select: { id: true },
    });

    if (allowed === null) {
      return null;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.edge.deleteMany({ where: { diagramId } });
      await tx.node.deleteMany({ where: { diagramId } });
      if (nodes.length > 0) {
        await tx.node.createMany({
          data: nodes.map(
            (n: SaveDiagramGraphInputNode): Prisma.NodeCreateManyInput => ({
              id: n.id,
              diagramId,
              label: n.label,
              type: n.type,
              x: n.x,
              y: n.y,
              width: n.width ?? null,
              height: n.height ?? null,
            }),
          ),
        });
      }
      if (edges.length > 0) {
        await tx.edge.createMany({
          data: edges.map(
            (e: SaveDiagramGraphInputEdge): Prisma.EdgeCreateManyInput => ({
              diagramId,
              fromNodeId: e.fromNodeId,
              toNodeId: e.toNodeId,
              label: e.label ?? null,
              type: e.type ?? null,
              animated: e.animated ?? false,
            }),
          ),
        });
      }
    });

    const after: Prisma.DiagramGetPayload<{
      select: typeof diagramFullSelect;
    }> | null = await this.prisma.diagram.findUnique({
      where: { id: diagramId },
      select: diagramFullSelect,
    });

    return after === null ? null : mapPrismaDiagramToRecord(after);
  }

  public async updateDiagramPatchByIdAndOwnerId(
    id: string,
    ownerId: string,
    patch: { title?: string; visibility?: Visibility },
  ): Promise<DiagramRecord | null> {
    const existing: DiagramRecord | null =
      await this.selectDiagramByIdAndOwnerId(id, ownerId);

    if (existing === null) {
      return null;
    }

    const data: Prisma.DiagramUpdateInput = {};
    if (patch.title !== undefined) {
      data.title = patch.title;
    }
    if (patch.visibility !== undefined) {
      data.visibility = patch.visibility;
    }

    const row: Prisma.DiagramGetPayload<{ select: typeof diagramFullSelect }> =
      await this.prisma.diagram.update({
        where: { id },
        data,
        select: diagramFullSelect,
      });

    return mapPrismaDiagramToRecord(row);
  }

  public async deleteDiagramByIdAndOwnerId(
    id: string,
    ownerId: string,
  ): Promise<boolean> {
    const result = await this.prisma.diagram.deleteMany({
      where: { id, ownerId },
    });
    return result.count > 0;
  }

  public async insertDiagramFavorite(
    userId: string,
    diagramId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.diagramFavorite.create({
        data: {
          userId,
          diagramId,
        },
      });
      await tx.diagram.update({
        where: { id: diagramId },
        data: {
          favoriteCount: {
            increment: 1,
          },
        },
      });
    });
  }

  public async selectPublicDiagramsByQuery(
    searchTerm: string,
    take: number,
  ): Promise<DiagramSearchRow[]> {
    const rows = await this.prisma.diagram.findMany({
      where: {
        visibility: VisibilityEnum.PUBLIC,
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            nodes: {
              some: {
                label: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      },
      take,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        ownerId: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        nodes: {
          select: { label: true },
          take: 16,
        },
      },
    });

    return rows.map(
      (r: (typeof rows)[number]): DiagramSearchRow => ({
        id: r.id,
        title: r.title,
        ownerId: r.ownerId,
        visibility: r.visibility,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        owner: r.owner,
        nodeLabels: r.nodes.map(
          (n: (typeof r.nodes)[number]): string => n.label,
        ),
      }),
    );
  }

  public async selectPublicRelatedDiagramsBySharedNodeLabels(
    sourceDiagramId: string,
    take: number,
  ): Promise<DiagramSummary[]> {
    const source: { nodes: { label: string }[] } | null =
      await this.prisma.diagram.findUnique({
        where: { id: sourceDiagramId },
        select: {
          nodes: { select: { label: true } },
        },
      });

    if (source === null) {
      return [];
    }

    const labelSet: Set<string> = new Set<string>();
    for (const n of source.nodes) {
      const trimmed: string = n.label.trim();
      if (trimmed.length > 0) {
        labelSet.add(trimmed);
      }
    }

    const labels: string[] = [...labelSet];
    if (labels.length === 0) {
      return [];
    }

    const orFilters: Prisma.DiagramWhereInput[] = labels.map(
      (label: string): Prisma.DiagramWhereInput => ({
        nodes: {
          some: {
            label: { equals: label, mode: 'insensitive' },
          },
        },
      }),
    );

    const rows = await this.prisma.diagram.findMany({
      where: {
        id: { not: sourceDiagramId },
        visibility: VisibilityEnum.PUBLIC,
        OR: orFilters,
      },
      take,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        ownerId: true,
        visibility: true,
        favoriteCount: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { nodes: true } },
      },
    });

    return rows.map(
      (r: (typeof rows)[number]): DiagramSummary => ({
        id: r.id,
        title: r.title,
        ownerId: r.ownerId,
        visibility: r.visibility,
        accessRole: 'viewer',
        nodeCount: r._count.nodes,
        favoriteCount: r.favoriteCount,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }),
    );
  }

  public async insertDiagramCollaborator(
    diagramId: string,
    userId: string,
  ): Promise<void> {
    await this.prisma.diagramCollaborator.create({
      data: {
        diagramId,
        userId,
      },
    });
  }

  public async deleteDiagramCollaborator(
    diagramId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.prisma.diagramCollaborator.deleteMany({
      where: { diagramId, userId },
    });
    return result.count > 0;
  }

  public async selectDiagramCollaborators(
    diagramId: string,
  ): Promise<readonly DiagramCollaboratorEntry[]> {
    const rows = await this.prisma.diagramCollaborator.findMany({
      where: { diagramId },
      orderBy: { createdAt: 'asc' },
      select: {
        userId: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return rows.map(
      (r: (typeof rows)[number]): DiagramCollaboratorEntry => ({
        userId: r.userId,
        email: r.user.email,
        name: r.user.name,
      }),
    );
  }
}
