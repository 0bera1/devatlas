export interface InterviewQuestionRecord {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly tags: string[];
  readonly difficulty: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
