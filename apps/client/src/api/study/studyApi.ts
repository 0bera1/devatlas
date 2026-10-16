import { apiClient } from '@/api/http/api-client';

export type ReviewRating = 0 | 1 | 2 | 3;

export interface DueQuestion {
  id: string;
  slug: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  difficulty: string | null;
}

export interface DueReview {
  questionId: string;
  dueAt: string;
  repetitions: number;
  question: DueQuestion;
}

export interface StudyProgress {
  dueNow: number;
  tracked: number;
  learned: number;
  totalQuestions: number;
}

export interface ReviewResult {
  dueAt: string;
  intervalDays: number;
  repetitions: number;
}

export interface StudyListSummary {
  id: string;
  name: string;
  itemCount: number;
  createdAt: string;
}

export const studyApi = {
  async due(accessToken: string, limit: number): Promise<DueReview[]> {
    const response = await apiClient.get<DueReview[]>(`/study/due?limit=${limit}`, { accessToken });
    return response.data;
  },

  async progress(accessToken: string): Promise<StudyProgress> {
    const response = await apiClient.get<StudyProgress>('/study/progress', { accessToken });
    return response.data;
  },

  async review(accessToken: string, questionId: string, rating: ReviewRating): Promise<ReviewResult> {
    const response = await apiClient.post<ReviewResult>('/study/reviews', {
      accessToken,
      body: { questionId, rating },
    });
    return response.data;
  },

  async lists(accessToken: string): Promise<StudyListSummary[]> {
    const response = await apiClient.get<StudyListSummary[]>('/study/lists', { accessToken });
    return response.data;
  },

  async createList(accessToken: string, name: string): Promise<StudyListSummary> {
    const response = await apiClient.post<StudyListSummary>('/study/lists', {
      accessToken,
      body: { name },
    });
    return response.data;
  },
};
