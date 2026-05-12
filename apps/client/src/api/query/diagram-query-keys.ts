export const diagramQueryKeys = {
  all: ['diagrams'] as const,
  lists: (): readonly ['diagrams', 'list'] => ['diagrams', 'list'] as const,
  details: (): readonly ['diagrams', 'detail'] => ['diagrams', 'detail'] as const,
  detail: (id: string): readonly ['diagrams', 'detail', string] =>
    ['diagrams', 'detail', id] as const,
  related: (
    id: string,
    authBucket: 'auth' | 'anon',
  ): readonly ['diagrams', 'related', string, 'auth' | 'anon'] =>
    ['diagrams', 'related', id, authBucket] as const,
  collaborators: (id: string): readonly ['diagrams', 'collaborators', string] =>
    ['diagrams', 'collaborators', id] as const,
} as const;
