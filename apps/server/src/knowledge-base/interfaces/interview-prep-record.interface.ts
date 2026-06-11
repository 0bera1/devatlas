import type { InterviewQuestionCategory } from '@prisma/client';
import type { InterviewKnowledgeResources } from './knowledge-resource-ref.interface';

export interface InterviewPrepCategorySummary {
  readonly category: InterviewQuestionCategory;
  readonly questionCount: number;
}

export interface InterviewPrepQuestionSummary {
  readonly id: string;
  readonly slug: string;
  readonly question: string;
  readonly category: InterviewQuestionCategory;
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
  extends InterviewPrepQuestionSummary,
    InterviewKnowledgeResources {
  readonly answer: string;
  readonly followUps: readonly InterviewPrepFollowUpSummary[];
}
