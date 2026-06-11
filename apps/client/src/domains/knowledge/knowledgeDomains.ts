export interface KnowledgeDocumentSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocumentRecord extends KnowledgeDocumentSummary {
  content: string;
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
}

export type KnowledgeSection =
  | 'interview'
  | 'documents'
  | 'diagrams'
  | 'flows';

export type InterviewPrepCategory =
  | 'FRONTEND'
  | 'BACKEND'
  | 'DEVOPS'
  | 'ARCHITECTURE'
  | 'GENERAL';

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

export interface InterviewPrepQuestionDetail
  extends InterviewPrepQuestionSummary {
  readonly answer: string;
  readonly followUps: readonly InterviewPrepFollowUpSummary[];
}
