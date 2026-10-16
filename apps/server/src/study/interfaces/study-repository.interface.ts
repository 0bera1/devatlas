import type { ReviewRating, ReviewState } from '../spaced-repetition';

export const STUDY_REPOSITORY: unique symbol = Symbol('STUDY_REPOSITORY');

export interface DueReviewRow {
  questionId: string;
  dueAt: Date;
  repetitions: number;
  question: {
    id: string;
    slug: string;
    question: string;
    answer: string;
    category: string;
    tags: string[];
    difficulty: string | null;
  };
}

export interface StudyListSummary {
  id: string;
  name: string;
  itemCount: number;
  createdAt: Date;
}

export interface StudyListItemRow {
  questionId: string;
  question: {
    id: string;
    slug: string;
    question: string;
    category: string;
    difficulty: string | null;
  };
}

export interface SaveReviewParams extends ReviewState {
  userId: string;
  questionId: string;
  rating: ReviewRating;
  dueAt: Date;
}

export interface IStudyRepository {
  findQuestionById(id: string): Promise<{ id: string } | null>;
  findDueReviews(userId: string, now: Date, limit: number): Promise<DueReviewRow[]>;
  findReview(userId: string, questionId: string): Promise<(ReviewState & { dueAt: Date }) | null>;
  saveReview(params: SaveReviewParams): Promise<void>;
  countDue(userId: string, now: Date): Promise<number>;
  countTracked(userId: string): Promise<number>;
  countLearned(userId: string): Promise<number>;
  countQuestions(): Promise<number>;
  findListsByUser(userId: string): Promise<StudyListSummary[]>;
  createList(userId: string, name: string): Promise<StudyListSummary>;
  findListOwnedBy(listId: string, userId: string): Promise<{ id: string } | null>;
  deleteList(listId: string): Promise<void>;
  findListItems(listId: string): Promise<StudyListItemRow[]>;
  addListItem(listId: string, questionId: string): Promise<void>;
  removeListItem(listId: string, questionId: string): Promise<void>;
}
