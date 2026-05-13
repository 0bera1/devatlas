import { Inject, Injectable } from '@nestjs/common';
import { Prisma, Visibility as VisibilityEnum } from '@prisma/client';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import {
  INTERVIEW_MARKERS,
  RELATED_NODE_LABEL_LIMIT,
} from './constants/intelligence.constants';
import type {
  AccessibleDocumentTagsRow,
  DiagramKeywordNodeRow,
  DiagramRecommendationRow,
  DocumentRecommendationRow,
  IIntelligenceRepository,
} from './interfaces/intelligence-repository.interface';

const diagramRecommendationSelect = {
  id: true,
  title: true,
  ownerId: true,
  visibility: true,
  favoriteCount: true,
  createdAt: true,
  updatedAt: true,
  nodes: {
    select: { label: true },
    take: RELATED_NODE_LABEL_LIMIT,
  },
  _count: { select: { nodes: true } },
} satisfies Prisma.DiagramSelect;

const documentRecommendationSelect = {
  id: true,
  title: true,
  content: true,
  ownerId: true,
  visibility: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  viewCount: true,
  favoriteCount: true,
  createdAt: true,
  updatedAt: true,
  documentTags: {
    select: {
      tag: {
        select: {
          name: true,
        },
      },
    },
  },
} satisfies Prisma.DocumentSelect;

@Injectable()
export class IntelligenceRepository implements IIntelligenceRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async selectAccessibleDiagramId(
    diagramId: string,
    viewerUserId: string | null,
  ): Promise<string | null> {
    const accessFilter: Prisma.DiagramWhereInput =
      viewerUserId === null
        ? { visibility: VisibilityEnum.PUBLIC }
        : {
            OR: [
              { visibility: VisibilityEnum.PUBLIC },
              { ownerId: viewerUserId },
              { collaborators: { some: { userId: viewerUserId } } },
            ],
          };

    const row: { id: string } | null = await this.prisma.diagram.findFirst({
      where: {
        id: diagramId,
        ...accessFilter,
      },
      select: { id: true },
    });

    return row?.id ?? null;
  }

  public async selectNodeLabelsByDiagramId(
    diagramId: string,
  ): Promise<DiagramKeywordNodeRow[]> {
    return this.prisma.node.findMany({
      where: { diagramId },
      select: { label: true },
      orderBy: { id: 'asc' },
    });
  }

  public async selectPublicDiagramCandidatesByKeywords(
    sourceDiagramId: string,
    keywords: readonly string[],
    take: number,
  ): Promise<DiagramRecommendationRow[]> {
    const keywordFilters: Prisma.DiagramWhereInput[] =
      this.buildDiagramKeywordFilters(keywords);

    if (keywordFilters.length === 0) {
      return [];
    }

    return this.prisma.diagram.findMany({
      where: {
        id: { not: sourceDiagramId },
        visibility: VisibilityEnum.PUBLIC,
        OR: keywordFilters,
      },
      take,
      orderBy: { updatedAt: 'desc' },
      select: diagramRecommendationSelect,
    });
  }

  public async selectPublicDocumentCandidatesByKeywords(
    keywords: readonly string[],
    take: number,
    interviewOnly: boolean,
  ): Promise<DocumentRecommendationRow[]> {
    const keywordFilters: Prisma.DocumentWhereInput[] =
      this.buildDocumentKeywordFilters(keywords);

    if (keywordFilters.length === 0) {
      return [];
    }

    const markerFilters: Prisma.DocumentWhereInput[] = interviewOnly
      ? this.buildDocumentInterviewMarkerFilters()
      : [];

    const where: Prisma.DocumentWhereInput = {
      visibility: VisibilityEnum.PUBLIC,
      AND:
        markerFilters.length > 0
          ? [{ OR: keywordFilters }, { OR: markerFilters }]
          : [{ OR: keywordFilters }],
    };

    return this.prisma.document.findMany({
      where,
      take,
      orderBy: [
        { favoriteCount: 'desc' },
        { viewCount: 'desc' },
      ],
      select: documentRecommendationSelect,
    });
  }

  public async selectPublicTechnologyDiagramCandidatesByKeywords(
    sourceDiagramId: string,
    keywords: readonly string[],
    take: number,
  ): Promise<DiagramRecommendationRow[]> {
    return this.selectPublicDiagramCandidatesByKeywords(
      sourceDiagramId,
      keywords,
      take,
    );
  }

  public async selectAccessibleDocumentTags(
    documentId: string,
    viewerUserId: string | null,
  ): Promise<AccessibleDocumentTagsRow | null> {
    const accessFilter: Prisma.DocumentWhereInput =
      viewerUserId === null
        ? { visibility: VisibilityEnum.PUBLIC }
        : {
            OR: [
              { visibility: VisibilityEnum.PUBLIC },
              { ownerId: viewerUserId },
            ],
          };

    const row = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        ...accessFilter,
      },
      select: {
        id: true,
        category: { select: { name: true } },
        documentTags: {
          select: {
            tag: { select: { name: true } },
          },
        },
      },
    });

    if (row === null) {
      return null;
    }

    const tagNames: string[] = row.documentTags
      .map((entry) => entry.tag.name)
      .filter((name: string) => typeof name === 'string' && name.length > 0);

    return {
      id: row.id,
      tagNames,
      categoryName: row.category?.name ?? null,
    };
  }

  private buildDiagramKeywordFilters(
    keywords: readonly string[],
  ): Prisma.DiagramWhereInput[] {
    return keywords.map(
      (keyword: string): Prisma.DiagramWhereInput => ({
        nodes: {
          some: {
            label: {
              equals: keyword,
              mode: 'insensitive',
            },
          },
        },
      }),
    );
  }

  private buildDocumentKeywordFilters(
    keywords: readonly string[],
  ): Prisma.DocumentWhereInput[] {
    const filters: Prisma.DocumentWhereInput[] = [];
    for (const keyword of keywords) {
      filters.push(
        {
          title: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          documentTags: {
            some: {
              tag: {
                name: {
                  contains: keyword,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
        {
          category: {
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        },
      );
    }
    return filters;
  }

  private buildDocumentInterviewMarkerFilters(): Prisma.DocumentWhereInput[] {
    const filters: Prisma.DocumentWhereInput[] = [];
    for (const marker of INTERVIEW_MARKERS) {
      filters.push(
        {
          title: {
            contains: marker,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: marker,
            mode: 'insensitive',
          },
        },
      );
    }
    return filters;
  }
}
