import type { InterviewQuestionCategory, Prisma } from '@prisma/client';

export const KNOWLEDGE_GLOBAL_SEARCH_LIMIT = 20;

export function parseKnowledgeSearch(raw: string | undefined): string | null {
  const trimmed: string = raw?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export function buildSystemDocumentSearchWhere(
  search: string | null,
): Prisma.SystemDocumentWhereInput {
  if (search === null) {
    return {};
  }
  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ],
  };
}

export function buildSystemDiagramSearchWhere(
  search: string | null,
): Prisma.SystemDiagramWhereInput {
  if (search === null) {
    return {};
  }
  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { narrativeTr: { contains: search, mode: 'insensitive' } },
      { narrativeEn: { contains: search, mode: 'insensitive' } },
    ],
  };
}

export function buildSystemFlowSearchWhere(
  search: string | null,
): Prisma.SystemFlowWhereInput {
  if (search === null) {
    return {};
  }
  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { narrativeTr: { contains: search, mode: 'insensitive' } },
      { narrativeEn: { contains: search, mode: 'insensitive' } },
    ],
  };
}

export function buildInterviewQuestionSearchWhere(
  search: string,
): Prisma.InterviewQuestionWhereInput {
  return buildInterviewQuestionListWhere(search, null);
}

export function buildInterviewQuestionListWhere(
  search: string | null,
  category: InterviewQuestionCategory | null,
  difficulty: string | null = null,
): Prisma.InterviewQuestionWhereInput {
  const where: Prisma.InterviewQuestionWhereInput = { parentId: null };
  if (category !== null) {
    where.category = category;
  }
  if (difficulty !== null) {
    where.difficulty = difficulty;
  }
  if (search === null) {
    return where;
  }
  return {
    ...where,
    OR: [
      { question: { contains: search, mode: 'insensitive' } },
      { questionEn: { contains: search, mode: 'insensitive' } },
      { answer: { contains: search, mode: 'insensitive' } },
      { answerEn: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
      {
        followUps: {
          some: {
            OR: [
              { question: { contains: search, mode: 'insensitive' } },
              { questionEn: { contains: search, mode: 'insensitive' } },
              { answer: { contains: search, mode: 'insensitive' } },
              { answerEn: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
    ],
  };
}
