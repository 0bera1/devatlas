import type {
  InterviewPrepCategory,
  InterviewPrepDifficulty,
  KnowledgeSection,
} from '@/domains/knowledge/knowledgeDomains';
import {
  INTERVIEW_CATEGORY_PARAM,
  readStoredInterviewCategory,
} from '@/lib/knowledge/interview-category-storage';
import {
  INTERVIEW_DIFFICULTY_PARAM,
  readStoredInterviewDifficulty,
} from '@/lib/knowledge/interview-difficulty-storage';

export const KNOWLEDGE_SECTION_STORAGE_KEY = 'devatlas_knowledge_section';

const KNOWLEDGE_SECTIONS: readonly KnowledgeSection[] = [
  'interview',
  'documents',
  'diagrams',
  'flows',
];

export function isKnowledgeSection(
  value: string | null | undefined,
): value is KnowledgeSection {
  if (value === null || value === undefined) {
    return false;
  }
  return (KNOWLEDGE_SECTIONS as readonly string[]).includes(value);
}

export function readStoredKnowledgeSection(): KnowledgeSection {
  if (typeof window === 'undefined') {
    return 'interview';
  }
  const raw: string | null = window.sessionStorage.getItem(
    KNOWLEDGE_SECTION_STORAGE_KEY,
  );
  return isKnowledgeSection(raw) ? raw : 'interview';
}

export function writeStoredKnowledgeSection(section: KnowledgeSection): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.setItem(KNOWLEDGE_SECTION_STORAGE_KEY, section);
}

export function resolveKnowledgeSectionFromPath(
  pathname: string,
): KnowledgeSection {
  if (pathname.startsWith('/knowledge/interview')) {
    return 'interview';
  }
  if (pathname.startsWith('/knowledge/documents')) {
    return 'documents';
  }
  if (pathname.startsWith('/knowledge/diagrams')) {
    return 'diagrams';
  }
  if (pathname.startsWith('/knowledge/flows')) {
    return 'flows';
  }
  return readStoredKnowledgeSection();
}

export interface BuildKnowledgeBaseHrefOptions {
  readonly interviewCategory?: InterviewPrepCategory | null;
  readonly useStoredInterviewCategory?: boolean;
  readonly interviewDifficulty?: InterviewPrepDifficulty | null;
  readonly useStoredInterviewDifficulty?: boolean;
}

export function buildKnowledgeBaseHref(
  section: KnowledgeSection,
  options?: BuildKnowledgeBaseHrefOptions,
): string {
  const params = new URLSearchParams();
  params.set('section', section);

  if (section === 'interview') {
    let category: InterviewPrepCategory | null | undefined =
      options?.interviewCategory;
    if (
      category === undefined &&
      options?.useStoredInterviewCategory !== false
    ) {
      category = readStoredInterviewCategory();
    }
    if (category !== null && category !== undefined) {
      params.set(INTERVIEW_CATEGORY_PARAM, category);
    }

    let difficulty: InterviewPrepDifficulty | null | undefined =
      options?.interviewDifficulty;
    if (
      difficulty === undefined &&
      options?.useStoredInterviewDifficulty !== false
    ) {
      difficulty = readStoredInterviewDifficulty();
    }
    if (difficulty !== null && difficulty !== undefined) {
      params.set(INTERVIEW_DIFFICULTY_PARAM, difficulty);
    }
  }

  return `/knowledge?${params.toString()}`;
}
