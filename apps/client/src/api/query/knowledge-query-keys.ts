import type { Locale } from '@/i18n';

export const knowledgeQueryKeys = {
  all: ['knowledge'] as const,
  documents: (): readonly ['knowledge', 'documents'] =>
    [...knowledgeQueryKeys.all, 'documents'] as const,
  document: (slug: string): readonly ['knowledge', 'documents', string] =>
    [...knowledgeQueryKeys.all, 'documents', slug] as const,
  diagrams: (
    locale: Locale,
  ): readonly ['knowledge', 'diagrams', typeof locale] =>
    [...knowledgeQueryKeys.all, 'diagrams', locale] as const,
  diagram: (
    slug: string,
    locale: Locale,
  ): readonly ['knowledge', 'diagrams', typeof locale, string] =>
    [...knowledgeQueryKeys.all, 'diagrams', locale, slug] as const,
  flows: (locale: Locale): readonly ['knowledge', 'flows', typeof locale] =>
    [...knowledgeQueryKeys.all, 'flows', locale] as const,
  flow: (
    slug: string,
    locale: Locale,
  ): readonly ['knowledge', 'flows', typeof locale, string] =>
    [...knowledgeQueryKeys.all, 'flows', locale, slug] as const,
};
