import type { Visibility } from '@prisma/client';

export const INTELLIGENCE_REPOSITORY: unique symbol = Symbol(
  'INTELLIGENCE_REPOSITORY',
);

export interface DiagramKeywordNodeRow {
  readonly label: string;
}

export interface DiagramRecommendationRow {
  readonly id: string;
  readonly title: string;
  readonly ownerId: string;
  readonly visibility: Visibility;
  readonly favoriteCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly nodes: readonly DiagramKeywordNodeRow[];
  readonly _count: {
    readonly nodes: number;
  };
}

export interface DocumentRecommendationRow {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly ownerId: string;
  readonly visibility: Visibility;
  readonly category: {
    readonly id: string;
    readonly name: string;
  } | null;
  readonly viewCount: number;
  readonly favoriteCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly documentTags: readonly {
    readonly tag: {
      readonly name: string;
    };
  }[];
}

export interface AccessibleDocumentTagsRow {
  readonly id: string;
  readonly tagNames: readonly string[];
  readonly categoryName: string | null;
}

export interface IIntelligenceRepository {
  selectAccessibleDiagramId(
    diagramId: string,
    viewerUserId: string | null,
  ): Promise<string | null>;
  selectNodeLabelsByDiagramId(
    diagramId: string,
  ): Promise<DiagramKeywordNodeRow[]>;
  selectPublicDiagramCandidatesByKeywords(
    sourceDiagramId: string,
    keywords: readonly string[],
    take: number,
  ): Promise<DiagramRecommendationRow[]>;
  selectPublicDocumentCandidatesByKeywords(
    keywords: readonly string[],
    take: number,
    interviewOnly: boolean,
  ): Promise<DocumentRecommendationRow[]>;
  selectPublicTechnologyDiagramCandidatesByKeywords(
    sourceDiagramId: string,
    keywords: readonly string[],
    take: number,
  ): Promise<DiagramRecommendationRow[]>;
  /**
   * Erişim kontrolü dahil doküman etiket/kategori listesi.
   * `viewerUserId === null` ise yalnızca PUBLIC dokümanlar görülür.
   * Erişim yoksa veya doküman yoksa `null` döner.
   */
  selectAccessibleDocumentTags(
    documentId: string,
    viewerUserId: string | null,
  ): Promise<AccessibleDocumentTagsRow | null>;
}
