import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type {
  KnowledgeDiagramEdgeRecord,
  KnowledgeDiagramNodeRecord,
  KnowledgeDiagramRecord,
  KnowledgeDiagramSummary,
} from './interfaces/knowledge-diagram-record.interface';
import type {
  KnowledgeDocumentRecord,
  KnowledgeDocumentSummary,
} from './interfaces/knowledge-document-record.interface';
import type {
  KnowledgeFlowRecord,
  KnowledgeFlowStepRecord,
  KnowledgeFlowSummary,
} from './interfaces/knowledge-flow-record.interface';
import type { IKnowledgeRepository } from './interfaces/knowledge-repository.interface';

const documentSummarySelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SystemDocumentSelect;

const diagramSummarySelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  narrative: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { nodes: true } },
} satisfies Prisma.SystemDiagramSelect;

const diagramFullSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  narrative: true,
  sortOrder: true,
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
      relatedDiagramId: true,
      extras: true,
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
} satisfies Prisma.SystemDiagramSelect;

const flowSummarySelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  narrative: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { steps: true } },
} satisfies Prisma.SystemFlowSelect;

@Injectable()
export class KnowledgeBaseRepository implements IKnowledgeRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async selectDocumentsOrdered(): Promise<KnowledgeDocumentSummary[]> {
    return this.prisma.systemDocument.findMany({
      select: documentSummarySelect,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
  }

  public async selectDocumentBySlug(
    slug: string,
  ): Promise<KnowledgeDocumentRecord | null> {
    return this.prisma.systemDocument.findUnique({
      where: { slug },
      select: { ...documentSummarySelect, content: true },
    });
  }

  public async selectDiagramsOrdered(): Promise<KnowledgeDiagramSummary[]> {
    const rows = await this.prisma.systemDiagram.findMany({
      select: diagramSummarySelect,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
    return rows.map(
      (row: (typeof rows)[number]): KnowledgeDiagramSummary => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        narrative: row.narrative,
        sortOrder: row.sortOrder,
        nodeCount: row._count.nodes,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  public async selectDiagramBySlug(
    slug: string,
  ): Promise<KnowledgeDiagramRecord | null> {
    const row = await this.prisma.systemDiagram.findUnique({
      where: { slug },
      select: diagramFullSelect,
    });
    if (row === null) {
      return null;
    }
    const nodes: KnowledgeDiagramNodeRecord[] = row.nodes.map(
      (n: (typeof row.nodes)[number]): KnowledgeDiagramNodeRecord => ({
        id: n.id,
        diagramId: n.diagramId,
        label: n.label,
        type: n.type,
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
        relatedDiagramId: n.relatedDiagramId,
        extras: n.extras ?? null,
      }),
    );
    const edges: KnowledgeDiagramEdgeRecord[] = row.edges.map(
      (e: (typeof row.edges)[number]): KnowledgeDiagramEdgeRecord => ({
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
      slug: row.slug,
      title: row.title,
      description: row.description,
      narrative: row.narrative,
      sortOrder: row.sortOrder,
      nodeCount: nodes.length,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      nodes,
      edges,
    };
  }

  public async selectFlowsOrdered(): Promise<KnowledgeFlowSummary[]> {
    const rows = await this.prisma.systemFlow.findMany({
      select: flowSummarySelect,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
    return rows.map(
      (row: (typeof rows)[number]): KnowledgeFlowSummary => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        narrative: row.narrative,
        sortOrder: row.sortOrder,
        stepCount: row._count.steps,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  public async selectFlowBySlug(
    slug: string,
  ): Promise<KnowledgeFlowRecord | null> {
    const row = await this.prisma.systemFlow.findUnique({
      where: { slug },
      select: {
        ...flowSummarySelect,
        steps: {
          orderBy: { stepOrder: 'asc' },
          select: {
            id: true,
            stepOrder: true,
            label: true,
            narrative: true,
            diagramId: true,
            diagram: { select: { slug: true, title: true } },
          },
        },
      },
    });
    if (row === null) {
      return null;
    }
    const steps: KnowledgeFlowStepRecord[] = row.steps.map(
      (s: (typeof row.steps)[number]): KnowledgeFlowStepRecord => ({
        id: s.id,
        stepOrder: s.stepOrder,
        label: s.label,
        narrative: s.narrative,
        diagramId: s.diagramId,
        diagramSlug: s.diagram.slug,
        diagramTitle: s.diagram.title,
      }),
    );
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      narrative: row.narrative,
      sortOrder: row.sortOrder,
      stepCount: steps.length,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      steps,
    };
  }
}
