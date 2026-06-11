export const KNOWLEDGE_LIST_PAGE_SIZE = 15;

export interface KnowledgeListQuery {
  readonly page: number;
  readonly pageSize: number;
  readonly search: string;
}

export interface PaginatedKnowledgeList<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export type InterviewPrepCategory =
  | 'FRONTEND'
  | 'BACKEND'
  | 'DEVOPS'
  | 'ARCHITECTURE'
  | 'GENERAL';

export type InterviewPrepDifficulty =
  | 'EASY'
  | 'MEDIUM'
  | 'HARD'
  | 'EXPERT';

export interface KnowledgeDocumentSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeResourceRef {
  readonly slug: string;
  readonly title: string;
}

export interface InterviewQuestionRef {
  readonly slug: string;
  readonly question: string;
  readonly category: InterviewPrepCategory;
}

export interface KnowledgeDocumentRecord extends KnowledgeDocumentSummary {
  content: string;
  relatedInterviewQuestions: readonly InterviewQuestionRef[];
}

export interface KnowledgeDiagramNodeRecord {
  id: string;
  diagramId: string;
  label: string;
  type: string;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  relatedDiagramId: string | null;
  extras: unknown | null;
}

export interface KnowledgeDiagramEdgeRecord {
  id: string;
  diagramId: string;
  fromNodeId: string;
  toNodeId: string;
  label: string | null;
  type: string | null;
  animated: boolean;
}

export interface KnowledgeDiagramSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  narrative: string | null;
  sortOrder: number;
  nodeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDiagramRecord extends KnowledgeDiagramSummary {
  nodes: KnowledgeDiagramNodeRecord[];
  edges: KnowledgeDiagramEdgeRecord[];
  relatedInterviewQuestions: readonly InterviewQuestionRef[];
}

export interface KnowledgeFlowStepRecord {
  id: string;
  stepOrder: number;
  label: string;
  narrative: string | null;
  diagramId: string;
  diagramSlug: string;
  diagramTitle: string;
}

export interface KnowledgeFlowSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  narrative: string | null;
  sortOrder: number;
  stepCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeFlowRecord extends KnowledgeFlowSummary {
  steps: KnowledgeFlowStepRecord[];
  relatedInterviewQuestions: readonly InterviewQuestionRef[];
}

export type KnowledgeSection =
  | 'interview'
  | 'documents'
  | 'diagrams'
  | 'flows';

export interface InterviewPrepCategorySummary {
  readonly category: InterviewPrepCategory;
  readonly questionCount: number;
}

export interface InterviewPrepQuestionSummary {
  readonly id: string;
  readonly slug: string;
  readonly question: string;
  readonly category: InterviewPrepCategory;
  readonly tags: readonly string[];
  readonly difficulty: string | null;
  readonly followUpCount: number;
}

export interface InterviewPrepFollowUpSummary {
  readonly id: string;
  readonly slug: string;
  readonly question: string;
  readonly answer: string;
}

export interface InterviewKnowledgeResources {
  readonly documents: readonly KnowledgeResourceRef[];
  readonly diagrams: readonly KnowledgeResourceRef[];
  readonly flows: readonly KnowledgeResourceRef[];
}

export interface InterviewPrepQuestionDetail
  extends InterviewPrepQuestionSummary,
    InterviewKnowledgeResources {
  readonly answer: string;
  readonly followUps: readonly InterviewPrepFollowUpSummary[];
}
