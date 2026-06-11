import { Inject, Injectable } from '@nestjs/common';
import type {
  InterviewKnowledgeResourceType,
  InterviewQuestionCategory,
  Prisma,
} from '@prisma/client';
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
import type {
  KnowledgeGlobalInterviewSearchRow,
  KnowledgeGlobalSearchRow,
} from './interfaces/knowledge-global-search-row.interface';
import type { IKnowledgeRepository } from './interfaces/knowledge-repository.interface';
import type {
  InterviewKnowledgeResources,
  InterviewQuestionRef,
  KnowledgeResourceRef,
} from './interfaces/knowledge-resource-ref.interface';
import { pickBilingualDocumentContent } from './knowledge-bilingual-document.util';
import {
  pickKnowledgeLocalizedText,
  pickKnowledgeNarrative,
  type KnowledgeContentLocale,
} from './knowledge-narrative-locale.util';
import {
  buildInterviewQuestionListWhere,
  buildInterviewQuestionSearchWhere,
  buildSystemDiagramSearchWhere,
  buildSystemDocumentSearchWhere,
  buildSystemFlowSearchWhere,
} from './knowledge-search.util';

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

  public async countDocuments(search: string | null): Promise<number> {
    return this.prisma.systemDocument.count({
      where: buildSystemDocumentSearchWhere(search),
    });
  }

  public async selectDocumentsPage(
    search: string | null,
    skip: number,
    take: number,
  ): Promise<KnowledgeDocumentSummary[]> {
    return this.prisma.systemDocument.findMany({
      where: buildSystemDocumentSearchWhere(search),
      select: documentSummarySelect,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      skip,
      take,
    });
  }

  public async selectDocumentBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<KnowledgeDocumentRecord | null> {
    const row = await this.prisma.systemDocument.findUnique({
      where: { slug },
      select: { ...documentSummarySelect, content: true },
    });
    if (row === null) {
      return null;
    }
    const relatedInterviewQuestions: readonly InterviewQuestionRef[] =
      await this.selectInterviewQuestionsByResource('DOCUMENT', slug, locale);
    return {
      ...row,
      content: pickBilingualDocumentContent(row.content, locale),
      relatedInterviewQuestions,
    };
  }

  public async countDiagrams(search: string | null): Promise<number> {
    return this.prisma.systemDiagram.count({
      where: buildSystemDiagramSearchWhere(search),
    });
  }

  public async selectDiagramsPage(
    locale: KnowledgeContentLocale,
    search: string | null,
    skip: number,
    take: number,
  ): Promise<KnowledgeDiagramSummary[]> {
    const rows = await this.prisma.systemDiagram.findMany({
      where: buildSystemDiagramSearchWhere(search),
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
    const relatedInterviewQuestions: readonly InterviewQuestionRef[] =
      await this.selectInterviewQuestionsByResource('DIAGRAM', slug, locale);
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
      relatedInterviewQuestions,
    };
  }

  public async countFlows(search: string | null): Promise<number> {
    return this.prisma.systemFlow.count({
      where: buildSystemFlowSearchWhere(search),
    });
  }

  public async selectFlowsPage(
    locale: KnowledgeContentLocale,
    search: string | null,
    skip: number,
    take: number,
  ): Promise<KnowledgeFlowSummary[]> {
    const rows = await this.prisma.systemFlow.findMany({
      where: buildSystemFlowSearchWhere(search),
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
    const relatedInterviewQuestions: readonly InterviewQuestionRef[] =
      await this.selectInterviewQuestionsByResource('FLOW', slug, locale);
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
      relatedInterviewQuestions,
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
    difficulty: string | null,
    search: string | null,
  ): Promise<number> {
    return this.prisma.interviewQuestion.count({
      where: buildInterviewQuestionListWhere(search, category, difficulty),
    });
  }

  public async selectInterviewPrepQuestionsByCategoryPage(
    category: InterviewQuestionCategory | null,
    difficulty: string | null,
    search: string | null,
    skip: number,
    take: number,
    locale: KnowledgeContentLocale,
  ): Promise<InterviewPrepQuestionSummary[]> {
    const rows = await this.prisma.interviewQuestion.findMany({
      where: buildInterviewQuestionListWhere(search, category, difficulty),
      orderBy: [{ category: 'asc' }, { question: 'asc' }],
      skip,
      take,
      select: {
        id: true,
        slug: true,
        question: true,
        questionEn: true,
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
        question: pickKnowledgeLocalizedText(
          row.question,
          row.questionEn,
          locale,
        ),
        category: row.category,
        tags: [...row.tags],
        difficulty: row.difficulty,
        followUpCount: row._count.followUps,
      }),
    );
  }

  public async selectInterviewPrepQuestionBySlug(
    slug: string,
    locale: KnowledgeContentLocale,
  ): Promise<InterviewPrepQuestionDetail | null> {
    const row = await this.prisma.interviewQuestion.findFirst({
      where: { slug },
      select: {
        id: true,
        parentId: true,
        slug: true,
        question: true,
        questionEn: true,
        answer: true,
        answerEn: true,
        category: true,
        tags: true,
        difficulty: true,
        followUps: {
          orderBy: { question: 'asc' },
          select: {
            id: true,
            slug: true,
            question: true,
            questionEn: true,
            answer: true,
            answerEn: true,
          },
        },
        parent: {
          select: {
            id: true,
            followUps: {
              orderBy: { question: 'asc' },
              select: {
                id: true,
                slug: true,
                question: true,
                questionEn: true,
                answer: true,
                answerEn: true,
              },
            },
            _count: { select: { followUps: true } },
          },
        },
        _count: { select: { followUps: true } },
      },
    });

    if (row === null) {
      return null;
    }

    const isFollowUp: boolean = row.parentId !== null;
    const linkQuestionId: string = isFollowUp
      ? (row.parentId as string)
      : row.id;
    const followUpRows = isFollowUp
      ? (row.parent?.followUps ?? [])
      : row.followUps;
    const followUpCount: number = isFollowUp
      ? (row.parent?._count.followUps ?? 0)
      : row._count.followUps;

    const followUps: InterviewPrepFollowUpSummary[] = followUpRows.map(
      (fu): InterviewPrepFollowUpSummary => ({
        id: fu.id,
        slug: fu.slug,
        question: pickKnowledgeLocalizedText(
          fu.question,
          fu.questionEn,
          locale,
        ),
        answer: pickKnowledgeLocalizedText(fu.answer, fu.answerEn, locale),
      }),
    );

    const relatedResources: InterviewKnowledgeResources =
      await this.selectInterviewKnowledgeResourcesByQuestionId(linkQuestionId);

    return {
      id: row.id,
      slug: row.slug,
      question: pickKnowledgeLocalizedText(
        row.question,
        row.questionEn,
        locale,
      ),
      answer: pickKnowledgeLocalizedText(row.answer, row.answerEn, locale),
      category: row.category,
      tags: [...row.tags],
      difficulty: row.difficulty,
      followUpCount,
      followUps,
      ...relatedResources,
    };
  }

  public async selectInterviewKnowledgeResourcesByQuestionId(
    questionId: string,
  ): Promise<InterviewKnowledgeResources> {
    const links = await this.prisma.interviewQuestionKnowledgeLink.findMany({
      where: { questionId },
      orderBy: [{ resourceType: 'asc' }, { sortOrder: 'asc' }],
      select: { resourceType: true, resourceSlug: true },
    });

    const documentSlugs: string[] = [];
    const diagramSlugs: string[] = [];
    const flowSlugs: string[] = [];

    for (const link of links) {
      switch (link.resourceType) {
        case 'DOCUMENT':
          documentSlugs.push(link.resourceSlug);
          break;
        case 'DIAGRAM':
          diagramSlugs.push(link.resourceSlug);
          break;
        case 'FLOW':
          flowSlugs.push(link.resourceSlug);
          break;
      }
    }

    const [documents, diagrams, flows] = await Promise.all([
      this.selectDocumentRefsBySlugs(documentSlugs),
      this.selectDiagramRefsBySlugs(diagramSlugs),
      this.selectFlowRefsBySlugs(flowSlugs),
    ]);

    return { documents, diagrams, flows };
  }

  public async selectInterviewQuestionsByResource(
    resourceType: InterviewKnowledgeResourceType,
    resourceSlug: string,
    locale: KnowledgeContentLocale,
  ): Promise<readonly InterviewQuestionRef[]> {
    const links = await this.prisma.interviewQuestionKnowledgeLink.findMany({
      where: { resourceType, resourceSlug },
      orderBy: [{ sortOrder: 'asc' }, { question: { question: 'asc' } }],
      select: {
        question: {
          select: {
            slug: true,
            question: true,
            questionEn: true,
            category: true,
            parentId: true,
          },
        },
      },
    });

    return links
      .filter((link) => link.question.parentId === null)
      .map(
        (link): InterviewQuestionRef => ({
          slug: link.question.slug,
          question: pickKnowledgeLocalizedText(
            link.question.question,
            link.question.questionEn,
            locale,
          ),
          category: link.question.category,
        }),
      );
  }

  public async selectDocumentRefsBySlugs(
    slugs: readonly string[],
  ): Promise<readonly KnowledgeResourceRef[]> {
    return this.selectResourceRefsBySlugs(
      slugs,
      await this.prisma.systemDocument.findMany({
        where: { slug: { in: [...slugs] } },
        select: { slug: true, title: true },
      }),
    );
  }

  public async selectDiagramRefsBySlugs(
    slugs: readonly string[],
  ): Promise<readonly KnowledgeResourceRef[]> {
    return this.selectResourceRefsBySlugs(
      slugs,
      await this.prisma.systemDiagram.findMany({
        where: { slug: { in: [...slugs] } },
        select: { slug: true, title: true },
      }),
    );
  }

  public async selectFlowRefsBySlugs(
    slugs: readonly string[],
  ): Promise<readonly KnowledgeResourceRef[]> {
    return this.selectResourceRefsBySlugs(
      slugs,
      await this.prisma.systemFlow.findMany({
        where: { slug: { in: [...slugs] } },
        select: { slug: true, title: true },
      }),
    );
  }

  private selectResourceRefsBySlugs(
    slugs: readonly string[],
    rows: readonly { slug: string; title: string }[],
  ): readonly KnowledgeResourceRef[] {
    if (slugs.length === 0) {
      return [];
    }
    const titleBySlug = new Map<string, string>(
      rows.map((row): [string, string] => [row.slug, row.title]),
    );
    const refs: KnowledgeResourceRef[] = [];
    for (const slug of slugs) {
      const title: string | undefined = titleBySlug.get(slug);
      if (title === undefined) {
        continue;
      }
      refs.push({ slug, title });
    }
    return refs;
  }

  public async selectDocumentsGlobalSearch(
    search: string,
    take: number,
  ): Promise<readonly KnowledgeGlobalSearchRow[]> {
    const rows = await this.prisma.systemDocument.findMany({
      where: buildSystemDocumentSearchWhere(search),
      take,
      orderBy: { updatedAt: 'desc' },
      select: {
        slug: true,
        title: true,
        summary: true,
        content: true,
        updatedAt: true,
      },
    });
    return rows.map(
      (row): KnowledgeGlobalSearchRow => ({
        slug: row.slug,
        title: row.title,
        previewSource: row.summary ?? row.content,
        updatedAt: row.updatedAt,
      }),
    );
  }

  public async selectDiagramsGlobalSearch(
    search: string,
    take: number,
  ): Promise<readonly KnowledgeGlobalSearchRow[]> {
    const rows = await this.prisma.systemDiagram.findMany({
      where: buildSystemDiagramSearchWhere(search),
      take,
      orderBy: { updatedAt: 'desc' },
      select: {
        slug: true,
        title: true,
        description: true,
        narrativeTr: true,
        narrativeEn: true,
        updatedAt: true,
      },
    });
    return rows.map(
      (row): KnowledgeGlobalSearchRow => ({
        slug: row.slug,
        title: row.title,
        previewSource:
          row.description ??
          row.narrativeTr ??
          row.narrativeEn ??
          row.title,
        updatedAt: row.updatedAt,
      }),
    );
  }

  public async selectFlowsGlobalSearch(
    search: string,
    take: number,
  ): Promise<readonly KnowledgeGlobalSearchRow[]> {
    const rows = await this.prisma.systemFlow.findMany({
      where: buildSystemFlowSearchWhere(search),
      take,
      orderBy: { updatedAt: 'desc' },
      select: {
        slug: true,
        title: true,
        description: true,
        narrativeTr: true,
        narrativeEn: true,
        updatedAt: true,
      },
    });
    return rows.map(
      (row): KnowledgeGlobalSearchRow => ({
        slug: row.slug,
        title: row.title,
        previewSource:
          row.description ??
          row.narrativeTr ??
          row.narrativeEn ??
          row.title,
        updatedAt: row.updatedAt,
      }),
    );
  }

  public async selectInterviewQuestionsGlobalSearch(
    search: string,
    take: number,
    locale: KnowledgeContentLocale,
  ): Promise<readonly KnowledgeGlobalInterviewSearchRow[]> {
    const rows = await this.prisma.interviewQuestion.findMany({
      where: buildInterviewQuestionSearchWhere(search),
      take,
      orderBy: { updatedAt: 'desc' },
      select: {
        slug: true,
        question: true,
        questionEn: true,
        answer: true,
        answerEn: true,
        category: true,
        parentId: true,
        updatedAt: true,
      },
    });
    return rows.map(
      (row): KnowledgeGlobalInterviewSearchRow => ({
        slug: row.slug,
        question: pickKnowledgeLocalizedText(
          row.question,
          row.questionEn,
          locale,
        ),
        answer: pickKnowledgeLocalizedText(row.answer, row.answerEn, locale),
        category: row.category,
        parentId: row.parentId,
        updatedAt: row.updatedAt,
      }),
    );
  }
}
