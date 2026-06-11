import type { InterviewQuestionRef } from './knowledge-resource-ref.interface';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeFlowRecord extends KnowledgeFlowSummary {
  steps: KnowledgeFlowStepRecord[];
  relatedInterviewQuestions: readonly InterviewQuestionRef[];
}
