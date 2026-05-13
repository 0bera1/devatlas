import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TECH_KEYWORD_EXTRACTOR,
  type ITechKeywordExtractor,
} from './auto-tag/interfaces/tech-keyword-extractor.interface';
import {
  ARCHITECTURE_TEMPLATE_MATCHER,
  type ArchitectureTemplateMatchResult,
  type IArchitectureTemplateMatcher,
} from './diagram-generation/interfaces/architecture-template-matcher.interface';
import type {
  ArchitectureTemplateEdge,
  ArchitectureTemplateNode,
} from './diagram-generation/interfaces/architecture-template.interface';
import {
  DIAGRAM_KEYWORDS_LIMIT,
  FAVORITE_SCORE,
  INTERVIEW_QUESTION_CANDIDATE_LIMIT,
  INTERVIEW_QUESTION_MATCH_SCORE,
  INTERVIEW_QUESTION_RESOURCE_LIMIT,
  INTERVIEW_QUESTION_TAG_LIMIT,
  MATCHING_KEYWORD_SCORE,
  RELATED_CANDIDATE_LIMIT,
  RELATED_RESOURCE_LIMIT,
} from './constants/intelligence.constants';
import type {
  DiagramIntelligenceResource,
  ScoredDiagramRecommendation,
  ScoredDocumentRecommendation,
  SimilarTechnologyRecommendation,
} from './interfaces/diagram-intelligence-resource.interface';
import type {
  GeneratedDiagramEdge,
  GeneratedDiagramNode,
  GeneratedDiagramTemplate,
} from './interfaces/generated-diagram-template.interface';
import {
  INTELLIGENCE_REPOSITORY,
  type AccessibleDocumentTagsRow,
  type DiagramKeywordNodeRow,
  type DiagramRecommendationRow,
  type DocumentRecommendationRow,
  type IIntelligenceRepository,
} from './interfaces/intelligence-repository.interface';
import type {
  AutoTagSource,
  IIntelligenceService,
} from './interfaces/intelligence-service.interface';
import type {
  RelatedInterviewQuestion,
  RelatedInterviewQuestionsResource,
} from './interfaces/related-interview-question.interface';
import {
  INTERVIEW_QUESTION_REPOSITORY,
  type IInterviewQuestionRepository,
} from './interview-questions/interfaces/interview-question-repository.interface';
import type { InterviewQuestionRecord } from './interview-questions/interfaces/interview-question-record.interface';

@Injectable()
export class IntelligenceService implements IIntelligenceService {
  public constructor(
    @Inject(INTELLIGENCE_REPOSITORY)
    private readonly intelligenceRepository: IIntelligenceRepository,
    @Inject(TECH_KEYWORD_EXTRACTOR)
    private readonly techKeywordExtractor: ITechKeywordExtractor,
    @Inject(ARCHITECTURE_TEMPLATE_MATCHER)
    private readonly architectureTemplateMatcher: IArchitectureTemplateMatcher,
    @Inject(INTERVIEW_QUESTION_REPOSITORY)
    private readonly interviewQuestionRepository: IInterviewQuestionRepository,
  ) {}

  public async getRelatedInterviewQuestionsForDocument(
    documentId: string,
    viewerUserId: string | null,
  ): Promise<RelatedInterviewQuestionsResource> {
    const accessibleTags: AccessibleDocumentTagsRow | null =
      await this.intelligenceRepository.selectAccessibleDocumentTags(
        documentId,
        viewerUserId,
      );

    if (accessibleTags === null) {
      throw new NotFoundException(`Document with id "${documentId}" not found`);
    }

    const documentTags: string[] = this.collectInterviewQuestionTags(
      accessibleTags,
    );

    if (documentTags.length === 0) {
      return {
        documentId: accessibleTags.id,
        documentTags,
        relatedInterviewQuestions: [],
      };
    }

    const candidates: InterviewQuestionRecord[] =
      await this.interviewQuestionRepository.selectQuestionsByTagsAnyMatch(
        documentTags,
        INTERVIEW_QUESTION_CANDIDATE_LIMIT,
      );

    const documentTagSet: Set<string> = new Set<string>(documentTags);

    const scored: RelatedInterviewQuestion[] = candidates
      .map(
        (candidate: InterviewQuestionRecord): RelatedInterviewQuestion =>
          this.scoreInterviewQuestion(candidate, documentTagSet),
      )
      .filter(
        (entry: RelatedInterviewQuestion): boolean =>
          entry.matchingTags.length > 0,
      )
      .sort(
        (a: RelatedInterviewQuestion, b: RelatedInterviewQuestion): number => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        },
      )
      .slice(0, INTERVIEW_QUESTION_RESOURCE_LIMIT);

    return {
      documentId: accessibleTags.id,
      documentTags,
      relatedInterviewQuestions: scored,
    };
  }

  private collectInterviewQuestionTags(
    row: AccessibleDocumentTagsRow,
  ): string[] {
    const collected: string[] = [];
    const seen: Set<string> = new Set<string>();

    for (const tag of row.tagNames) {
      const normalized: string = tag.trim().toLowerCase();
      if (normalized.length === 0 || seen.has(normalized)) {
        continue;
      }
      collected.push(normalized);
      seen.add(normalized);
      if (collected.length >= INTERVIEW_QUESTION_TAG_LIMIT) {
        return collected;
      }
    }

    if (row.categoryName !== null) {
      const normalizedCategory: string = row.categoryName.trim().toLowerCase();
      if (normalizedCategory.length > 0 && !seen.has(normalizedCategory)) {
        collected.push(normalizedCategory);
      }
    }

    return collected;
  }

  private scoreInterviewQuestion(
    candidate: InterviewQuestionRecord,
    documentTagSet: ReadonlySet<string>,
  ): RelatedInterviewQuestion {
    const matchingTags: string[] = [];
    const seen: Set<string> = new Set<string>();

    for (const rawTag of candidate.tags) {
      const normalized: string = rawTag.trim().toLowerCase();
      if (normalized.length === 0 || seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      if (documentTagSet.has(normalized)) {
        matchingTags.push(normalized);
      }
    }

    return {
      id: candidate.id,
      question: candidate.question,
      answer: candidate.answer,
      tags: [...candidate.tags],
      difficulty: candidate.difficulty,
      matchingTags,
      score: matchingTags.length * INTERVIEW_QUESTION_MATCH_SCORE,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };
  }

  public generateDiagramFromPrompt(prompt: string): GeneratedDiagramTemplate {
    const result: ArchitectureTemplateMatchResult =
      this.architectureTemplateMatcher.match(prompt);

    const nodes: GeneratedDiagramNode[] = result.template.nodes.map(
      (node: ArchitectureTemplateNode): GeneratedDiagramNode => ({
        localId: node.localId,
        label: node.label,
        type: node.type,
        x: node.x,
        y: node.y,
        width: node.width ?? null,
        height: node.height ?? null,
      }),
    );

    const edges: GeneratedDiagramEdge[] = result.template.edges.map(
      (edge: ArchitectureTemplateEdge): GeneratedDiagramEdge =>
        ({
          fromLocalId: edge.fromLocalId,
          toLocalId: edge.toLocalId,
          ...(edge.label === undefined ? {} : { label: edge.label }),
          ...(edge.type === undefined ? {} : { type: edge.type }),
          ...(edge.animated === undefined ? {} : { animated: edge.animated }),
        }) satisfies GeneratedDiagramEdge,
    );

    return {
      templateId: result.template.id,
      templateName: result.template.name,
      description: result.template.description,
      matchedKeywords: result.matchedKeywords,
      score: result.score,
      nodes,
      edges,
    };
  }

  public extractAutoTagsFromSource(source: AutoTagSource): string[] {
    const parts: string[] = [];

    if (source.title !== undefined && source.title.length > 0) {
      parts.push(source.title);
    }
    if (source.content !== undefined && source.content.length > 0) {
      parts.push(source.content);
    }
    if (source.extraKeywords !== undefined) {
      for (const keyword of source.extraKeywords) {
        if (keyword.length > 0) {
          parts.push(keyword);
        }
      }
    }

    if (parts.length === 0) {
      return [];
    }

    return this.techKeywordExtractor.extractFrom(parts.join('\n'));
  }

  public async extractDiagramKeywords(diagramId: string): Promise<string[]> {
    const nodes: DiagramKeywordNodeRow[] =
      await this.intelligenceRepository.selectNodeLabelsByDiagramId(diagramId);

    return this.normalizeKeywords(nodes.map((node) => node.label));
  }

  public async getDiagramResources(
    diagramId: string,
    viewerUserId: string | null,
  ): Promise<DiagramIntelligenceResource> {
    const accessibleDiagramId: string | null =
      await this.intelligenceRepository.selectAccessibleDiagramId(
        diagramId,
        viewerUserId,
      );

    if (accessibleDiagramId === null) {
      throw new NotFoundException(`Diagram with id "${diagramId}" not found`);
    }

    const semanticTags: string[] = await this.extractDiagramKeywords(diagramId);
    if (semanticTags.length === 0) {
      return {
        semanticTags,
        relatedDiagrams: [],
        relatedDocuments: [],
        relatedInterviewQuestions: [],
        similarTechnologies: [],
      };
    }

    const [diagramRows, documentRows, interviewRows, technologyRows] =
      await Promise.all([
        this.intelligenceRepository.selectPublicDiagramCandidatesByKeywords(
          diagramId,
          semanticTags,
          RELATED_CANDIDATE_LIMIT,
        ),
        this.intelligenceRepository.selectPublicDocumentCandidatesByKeywords(
          semanticTags,
          RELATED_CANDIDATE_LIMIT,
          false,
        ),
        this.intelligenceRepository.selectPublicDocumentCandidatesByKeywords(
          semanticTags,
          RELATED_CANDIDATE_LIMIT,
          true,
        ),
        this.intelligenceRepository.selectPublicTechnologyDiagramCandidatesByKeywords(
          diagramId,
          semanticTags,
          RELATED_CANDIDATE_LIMIT,
        ),
      ]);

    return {
      semanticTags,
      relatedDiagrams: this.scoreDiagramRows(diagramRows, semanticTags),
      relatedDocuments: this.scoreDocumentRows(documentRows, semanticTags),
      relatedInterviewQuestions: this.scoreDocumentRows(
        interviewRows,
        semanticTags,
      ),
      similarTechnologies: this.scoreSimilarTechnologies(
        technologyRows,
        semanticTags,
      ),
    };
  }

  private normalizeKeywords(labels: readonly string[]): string[] {
    const unique: Set<string> = new Set<string>();

    for (const label of labels) {
      const normalized: string = label.trim().toLowerCase();
      if (normalized.length === 0) {
        continue;
      }
      unique.add(normalized);
      if (unique.size >= DIAGRAM_KEYWORDS_LIMIT) {
        break;
      }
    }

    return [...unique];
  }

  private scoreDiagramRows(
    rows: readonly DiagramRecommendationRow[],
    semanticTags: readonly string[],
  ): ScoredDiagramRecommendation[] {
    const scored: ScoredDiagramRecommendation[] = rows
      .map((row: DiagramRecommendationRow): ScoredDiagramRecommendation => {
        const nodeLabels: string[] = row.nodes.map(
          (node: DiagramKeywordNodeRow): string => node.label,
        );
        const matchingKeywords: string[] = this.findMatchingKeywords(
          semanticTags,
          nodeLabels.join(' '),
        );

        return {
          id: row.id,
          title: row.title,
          ownerId: row.ownerId,
          visibility: row.visibility,
          accessRole: 'viewer',
          nodeCount: row._count.nodes,
          favoriteCount: row.favoriteCount,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          score: matchingKeywords.length * MATCHING_KEYWORD_SCORE,
          matchingKeywords,
        };
      })
      .filter(
        (item: ScoredDiagramRecommendation): boolean =>
          item.matchingKeywords.length > 0,
      );

    return this.takeTopByScore(scored);
  }

  private scoreDocumentRows(
    rows: readonly DocumentRecommendationRow[],
    semanticTags: readonly string[],
  ): ScoredDocumentRecommendation[] {
    const scored: ScoredDocumentRecommendation[] = rows
      .map((row: DocumentRecommendationRow): ScoredDocumentRecommendation => {
        const searchText: string = [
          row.title,
          row.content,
          row.category?.name ?? '',
          ...row.documentTags.map((item): string => item.tag.name),
        ].join(' ');
        const matchingKeywords: string[] = this.findMatchingKeywords(
          semanticTags,
          searchText,
        );

        return {
          id: row.id,
          title: row.title,
          content: row.content,
          ownerId: row.ownerId,
          visibility: row.visibility,
          category: row.category,
          viewCount: row.viewCount,
          favoriteCount: row.favoriteCount,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          score:
            matchingKeywords.length * MATCHING_KEYWORD_SCORE +
            row.favoriteCount * FAVORITE_SCORE +
            row.viewCount,
          matchingKeywords,
        };
      })
      .filter(
        (item: ScoredDocumentRecommendation): boolean =>
          item.matchingKeywords.length > 0,
      );

    return this.takeTopByScore(scored);
  }

  private scoreSimilarTechnologies(
    rows: readonly DiagramRecommendationRow[],
    semanticTags: readonly string[],
  ): SimilarTechnologyRecommendation[] {
    const sourceTagSet: Set<string> = new Set<string>(semanticTags);
    const aggregates: Map<
      string,
      { readonly label: string; relatedDiagramCount: number }
    > = new Map<string, { readonly label: string; relatedDiagramCount: number }>();

    for (const row of rows) {
      const seenInDiagram: Set<string> = new Set<string>();
      for (const node of row.nodes) {
        const normalized: string = node.label.trim().toLowerCase();
        if (normalized.length === 0 || sourceTagSet.has(normalized)) {
          continue;
        }
        seenInDiagram.add(normalized);
        if (!aggregates.has(normalized)) {
          aggregates.set(normalized, {
            label: node.label.trim(),
            relatedDiagramCount: 0,
          });
        }
      }

      for (const normalized of seenInDiagram) {
        const aggregate = aggregates.get(normalized);
        if (aggregate !== undefined) {
          aggregate.relatedDiagramCount += 1;
        }
      }
    }

    const scored: SimilarTechnologyRecommendation[] = [...aggregates.values()]
      .map(
        (aggregate): SimilarTechnologyRecommendation => ({
          label: aggregate.label,
          relatedDiagramCount: aggregate.relatedDiagramCount,
          score: aggregate.relatedDiagramCount * MATCHING_KEYWORD_SCORE,
        }),
      )
      .sort(
        (
          first: SimilarTechnologyRecommendation,
          second: SimilarTechnologyRecommendation,
        ): number => {
          if (second.score !== first.score) {
            return second.score - first.score;
          }
          return first.label.localeCompare(second.label);
        },
      );

    return scored.slice(0, RELATED_RESOURCE_LIMIT);
  }

  private findMatchingKeywords(
    semanticTags: readonly string[],
    rawText: string,
  ): string[] {
    const lowerText: string = rawText.toLowerCase();
    return semanticTags.filter((keyword: string): boolean =>
      lowerText.includes(keyword),
    );
  }

  private takeTopByScore<
    T extends { readonly score: number; readonly updatedAt: Date },
  >(items: readonly T[]): T[] {
    return [...items]
      .sort((first: T, second: T): number => {
        if (second.score !== first.score) {
          return second.score - first.score;
        }
        return second.updatedAt.getTime() - first.updatedAt.getTime();
      })
      .slice(0, RELATED_RESOURCE_LIMIT);
  }
}
