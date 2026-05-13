import type { InterviewQuestionRecord } from './interview-question-record.interface';

export const INTERVIEW_QUESTION_REPOSITORY: unique symbol = Symbol(
  'INTERVIEW_QUESTION_REPOSITORY',
);

export interface IInterviewQuestionRepository {
  /**
   * Verilen etiket setiyle en az bir tag'i çakışan mülakat sorularını döner.
   * Boş etiket listesinde sorgu yapılmaz; boş dizi döner.
   */
  selectQuestionsByTagsAnyMatch(
    tagNames: readonly string[],
    take: number,
  ): Promise<InterviewQuestionRecord[]>;
}
