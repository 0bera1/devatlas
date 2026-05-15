export const knowledgeQueryKeys = {
  all: ['knowledge'] as const,
  documents: (): readonly ['knowledge', 'documents'] =>
    [...knowledgeQueryKeys.all, 'documents'] as const,
  document: (slug: string): readonly ['knowledge', 'documents', string] =>
    [...knowledgeQueryKeys.all, 'documents', slug] as const,
  diagrams: (): readonly ['knowledge', 'diagrams'] =>
    [...knowledgeQueryKeys.all, 'diagrams'] as const,
  diagram: (slug: string): readonly ['knowledge', 'diagrams', string] =>
    [...knowledgeQueryKeys.all, 'diagrams', slug] as const,
  flows: (): readonly ['knowledge', 'flows'] =>
    [...knowledgeQueryKeys.all, 'flows'] as const,
  flow: (slug: string): readonly ['knowledge', 'flows', string] =>
    [...knowledgeQueryKeys.all, 'flows', slug] as const,
};
