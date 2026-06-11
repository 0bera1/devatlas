import type { InterviewQuestionCategory } from '@prisma/client';

export interface KnowledgeGlobalSearchRow {
  readonly slug: string;
  readonly title: string;
  readonly previewSource: string;
  readonly updatedAt: Date;
}

export interface KnowledgeGlobalInterviewSearchRow {
  readonly slug: string;
  readonly question: string;
  readonly answer: string;
  readonly category: InterviewQuestionCategory;
  readonly parentId: string | null;
  readonly updatedAt: Date;
}
