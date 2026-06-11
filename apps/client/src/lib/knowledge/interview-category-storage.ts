import type { InterviewPrepCategory } from '@/domains/knowledge/knowledgeDomains';

export const INTERVIEW_CATEGORY_STORAGE_KEY =
  'devatlas_interview_prep_category';

export const INTERVIEW_CATEGORY_PARAM = 'category';

const INTERVIEW_CATEGORIES: readonly InterviewPrepCategory[] = [
  'FRONTEND',
  'BACKEND',
  'DEVOPS',
  'ARCHITECTURE',
  'GENERAL',
];

export function isInterviewPrepCategory(
  value: string | null | undefined,
): value is InterviewPrepCategory {
  if (value === null || value === undefined) {
    return false;
  }
  return (INTERVIEW_CATEGORIES as readonly string[]).includes(value);
}

export function readStoredInterviewCategory(): InterviewPrepCategory | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw: string | null = window.sessionStorage.getItem(
    INTERVIEW_CATEGORY_STORAGE_KEY,
  );
  return isInterviewPrepCategory(raw) ? raw : null;
}

export function writeStoredInterviewCategory(
  category: InterviewPrepCategory | null,
): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (category === null) {
    window.sessionStorage.removeItem(INTERVIEW_CATEGORY_STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(INTERVIEW_CATEGORY_STORAGE_KEY, category);
}
