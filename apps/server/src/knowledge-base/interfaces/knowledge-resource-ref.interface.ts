import type { InterviewQuestionCategory } from '@prisma/client';

export interface KnowledgeResourceRef {
  readonly slug: string;
  readonly title: string;
}

export interface InterviewQuestionRef {
  readonly slug: string;
  readonly question: string;
  readonly category: InterviewQuestionCategory;
}

export interface InterviewKnowledgeResources {
  readonly documents: readonly KnowledgeResourceRef[];
  readonly diagrams: readonly KnowledgeResourceRef[];
  readonly flows: readonly KnowledgeResourceRef[];
}
