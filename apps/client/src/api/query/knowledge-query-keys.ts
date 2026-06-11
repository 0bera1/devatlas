import type {
  InterviewPrepCategory,
  InterviewPrepDifficulty,
} from '@/domains/knowledge/knowledgeDomains';
import type { Locale } from '@/i18n';

export const knowledgeQueryKeys = {
  all: ['knowledge'] as const,
  documents: (
    search: string,
  ): readonly ['knowledge', 'documents', string] =>
    [...knowledgeQueryKeys.all, 'documents', search] as const,
  document: (
    slug: string,
    locale: Locale,
  ): readonly ['knowledge', 'documents', typeof locale, string] =>
    [...knowledgeQueryKeys.all, 'documents', locale, slug] as const,
  diagrams: (
    locale: Locale,
    search: string,
  ): readonly ['knowledge', 'diagrams', typeof locale, string] =>
    [...knowledgeQueryKeys.all, 'diagrams', locale, search] as const,
  diagram: (
    slug: string,
    locale: Locale,
  ): readonly ['knowledge', 'diagrams', typeof locale, string] =>
    [...knowledgeQueryKeys.all, 'diagrams', locale, slug] as const,
  flows: (
    locale: Locale,
    search: string,
  ): readonly ['knowledge', 'flows', typeof locale, string] =>
    [...knowledgeQueryKeys.all, 'flows', locale, search] as const,
  flow: (
    slug: string,
    locale: Locale,
  ): readonly ['knowledge', 'flows', typeof locale, string] =>
    [...knowledgeQueryKeys.all, 'flows', locale, slug] as const,
  interviewCategories: (): readonly ['knowledge', 'interview', 'categories'] =>
    [...knowledgeQueryKeys.all, 'interview', 'categories'] as const,
  interviewQuestions: (
    locale: Locale,
    category: InterviewPrepCategory | 'all',
    difficulty: InterviewPrepDifficulty | 'all',
    search: string,
  ): readonly [
    'knowledge',
    'interview',
    'questions',
    typeof locale,
    typeof category,
    typeof difficulty,
    string,
  ] =>
    [
      ...knowledgeQueryKeys.all,
      'interview',
      'questions',
      locale,
      category,
      difficulty,
      search,
    ] as const,
  interviewQuestion: (
    slug: string,
    locale: Locale,
  ): readonly ['knowledge', 'interview', 'question', typeof locale, string] =>
    [...knowledgeQueryKeys.all, 'interview', 'question', locale, slug] as const,
};
