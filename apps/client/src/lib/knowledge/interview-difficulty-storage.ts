import type { InterviewPrepDifficulty } from '@/domains/knowledge/knowledgeDomains';

export const INTERVIEW_DIFFICULTY_STORAGE_KEY =
  'devatlas_interview_prep_difficulty';

export const INTERVIEW_DIFFICULTY_PARAM = 'difficulty';

const INTERVIEW_DIFFICULTIES: readonly InterviewPrepDifficulty[] = [
  'EASY',
  'MEDIUM',
  'HARD',
  'EXPERT',
];

export function isInterviewPrepDifficulty(
  value: string | null | undefined,
): value is InterviewPrepDifficulty {
  if (value === null || value === undefined) {
    return false;
  }
  return (INTERVIEW_DIFFICULTIES as readonly string[]).includes(value);
}

export function readStoredInterviewDifficulty(): InterviewPrepDifficulty | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw: string | null = window.sessionStorage.getItem(
    INTERVIEW_DIFFICULTY_STORAGE_KEY,
  );
  return isInterviewPrepDifficulty(raw) ? raw : null;
}

export function writeStoredInterviewDifficulty(
  difficulty: InterviewPrepDifficulty | null,
): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (difficulty === null) {
    window.sessionStorage.removeItem(INTERVIEW_DIFFICULTY_STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(INTERVIEW_DIFFICULTY_STORAGE_KEY, difficulty);
}

export const INTERVIEW_DIFFICULTY_OPTIONS: readonly InterviewPrepDifficulty[] =
  INTERVIEW_DIFFICULTIES;
