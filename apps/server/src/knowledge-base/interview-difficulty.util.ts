export type InterviewQuestionDifficulty =
  | 'EASY'
  | 'MEDIUM'
  | 'HARD'
  | 'EXPERT';

const INTERVIEW_DIFFICULTIES: readonly InterviewQuestionDifficulty[] = [
  'EASY',
  'MEDIUM',
  'HARD',
  'EXPERT',
];

export function isInterviewQuestionDifficulty(
  value: string | null | undefined,
): value is InterviewQuestionDifficulty {
  if (value === null || value === undefined) {
    return false;
  }
  return (INTERVIEW_DIFFICULTIES as readonly string[]).includes(value);
}

export function parseInterviewQuestionDifficulty(
  raw: string | undefined,
): InterviewQuestionDifficulty | null {
  if (raw === undefined || raw.trim().length === 0) {
    return null;
  }
  const normalized: string = raw.trim().toUpperCase();
  if (isInterviewQuestionDifficulty(normalized)) {
    return normalized;
  }
  return null;
}
