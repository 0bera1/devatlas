import type { InterviewQuestionRecord } from './interview-question-record.interface';
export declare const INTERVIEW_QUESTION_REPOSITORY: unique symbol;
export interface IInterviewQuestionRepository {
    selectQuestionsByTagsAnyMatch(tagNames: readonly string[], take: number): Promise<InterviewQuestionRecord[]>;
}
