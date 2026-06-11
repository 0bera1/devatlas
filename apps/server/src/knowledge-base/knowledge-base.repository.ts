import { Inject, Injectable } from '@nestjs/common';
import type { InterviewQuestionCategory, Prisma } from '@prisma/client';
import type {
  InterviewPrepCategorySummary,
  InterviewPrepFollowUpSummary,
  InterviewPrepQuestionDetail,
  InterviewPrepQuestionSummary,
} from './interfaces/interview-prep-record.interface';
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
import {
  pickKnowledgeNarrative,
  type KnowledgeContentLocale,
} from './knowledge-narrative-locale.util';

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
  narrativeTr: true,
  narrativeEn: true,
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
  narrativeTr: true,
  narrativeEn: true,
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
  narrativeTr: true,
  narrativeEn: true,
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

  public async countDocuments(): Promise<number> {
    return this.prisma.systemDocument.count();
  }

  public async selectDocumentsPage(
    skip: number,
    take: number,
  ): Promise<KnowledgeDocumentSummary[]> {
    return this.prisma.systemDocument.findMany({
      select: documentSummarySelect,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      skip,
      take,
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

  public async countDiagrams(): Promise<number> {
    return this.prisma.systemDiagram.count();
  }

  public async selectDiagramsPage(
    locale: KnowledgeContentLocale,
    skip: number,
    take: number,
  ): Promise<KnowledgeDiagramSummary[]> {
    const rows = await this.prisma.systemDiagram.findMany({
      select: diagramSummarySelect,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      skip,
      take,
    });
    return rows.map(
      (row: (typeof rows)[number]): KnowledgeDiagramSummary => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        narrative: pickKnowledgeNarrative(
          row.narrativeTr,
          row.narrativeEn,
          locale,
        ),
        sortOrder: row.sortOrder,
        nodeCount: row._count.nodes,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  public async selectDiagramBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
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
      narrative: pickKnowledgeNarrative(
        row.narrativeTr,
        row.narrativeEn,
        locale,
      ),
      sortOrder: row.sortOrder,
      nodeCount: nodes.length,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      nodes,
      edges,
    };
  }

  public async countFlows(): Promise<number> {
    return this.prisma.systemFlow.count();
  }

  public async selectFlowsPage(
    locale: KnowledgeContentLocale,
    skip: number,
    take: number,
  ): Promise<KnowledgeFlowSummary[]> {
    const rows = await this.prisma.systemFlow.findMany({
      select: flowSummarySelect,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      skip,
      take,
    });
    return rows.map(
      (row: (typeof rows)[number]): KnowledgeFlowSummary => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        narrative: pickKnowledgeNarrative(
          row.narrativeTr,
          row.narrativeEn,
          locale,
        ),
        sortOrder: row.sortOrder,
        stepCount: row._count.steps,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  public async selectFlowBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
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
            narrativeTr: true,
            narrativeEn: true,
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
        narrative: pickKnowledgeNarrative(
          s.narrativeTr,
          s.narrativeEn,
          locale,
        ),
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
      narrative: pickKnowledgeNarrative(
        row.narrativeTr,
        row.narrativeEn,
        locale,
      ),
      sortOrder: row.sortOrder,
      stepCount: steps.length,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      steps,
    };
  }

  public async selectInterviewPrepCategoryCounts(): Promise<
    InterviewPrepCategorySummary[]
  > {
    const grouped = await this.prisma.interviewQuestion.groupBy({
      by: ['category'],
      where: { parentId: null },
      _count: { _all: true },
      orderBy: { category: 'asc' },
    });

    return grouped.map(
      (row): InterviewPrepCategorySummary => ({
        category: row.category,
        questionCount: row._count._all,
      }),
    );
  }

  public async countInterviewPrepQuestionsByCategory(
    category: InterviewQuestionCategory | null,
  ): Promise<number> {
    const where: Prisma.InterviewQuestionWhereInput = { parentId: null };
    if (category !== null) {
      where.category = category;
    }
    return this.prisma.interviewQuestion.count({ where });
  }

  public async selectInterviewPrepQuestionsByCategoryPage(
    category: InterviewQuestionCategory | null,
    skip: number,
    take: number,
  ): Promise<InterviewPrepQuestionSummary[]> {
    const where: Prisma.InterviewQuestionWhereInput = { parentId: null };
    if (category !== null) {
      where.category = category;
    }

    const rows = await this.prisma.interviewQuestion.findMany({
      where,
      orderBy: [{ category: 'asc' }, { question: 'asc' }],
      skip,
      take,
      select: {
        id: true,
        slug: true,
        question: true,
        category: true,
        tags: true,
        difficulty: true,
        _count: { select: { followUps: true } },
      },
    });

    return rows.map(
      (row): InterviewPrepQuestionSummary => ({
        id: row.id,
        slug: row.slug,
        question: row.question,
        category: row.category,
        tags: [...row.tags],
        difficulty: row.difficulty,
        followUpCount: row._count.followUps,
      }),
    );
  }

  public async selectInterviewPrepQuestionBySlug(
    slug: string,
  ): Promise<InterviewPrepQuestionDetail | null> {
    const row = await this.prisma.interviewQuestion.findFirst({
      where: { slug, parentId: null },
      select: {
        id: true,
        slug: true,
        question: true,
        answer: true,
        category: true,
        tags: true,
        difficulty: true,
        followUps: {
          orderBy: { question: 'asc' },
          select: {
            id: true,
            slug: true,
            question: true,
            answer: true,
          },
        },
        _count: { select: { followUps: true } },
      },
    });

    if (row === null) {
      return null;
    }

    const followUps: InterviewPrepFollowUpSummary[] = row.followUps.map(
      (fu): InterviewPrepFollowUpSummary => ({
        id: fu.id,
        slug: fu.slug,
        question: fu.question,
        answer: fu.answer,
      }),
    );

    return {
      id: row.id,
      slug: row.slug,
      question: row.question,
      answer: row.answer,
      category: row.category,
      tags: [...row.tags],
      difficulty: row.difficulty,
      followUpCount: row._count.followUps,
      followUps,
    };
  }
}
