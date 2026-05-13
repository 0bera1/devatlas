export const profileQueryKeys = {
  all: ['profile'] as const,
  me: (): readonly ['profile', 'me'] => ['profile', 'me'] as const,
  favoriteDocuments: (): readonly ['profile', 'favorites', 'documents'] =>
    ['profile', 'favorites', 'documents'] as const,
  favoriteDiagrams: (): readonly ['profile', 'favorites', 'diagrams'] =>
    ['profile', 'favorites', 'diagrams'] as const,
  activity: (
    from: string | null,
    to: string | null,
  ): readonly ['profile', 'activity', string | null, string | null] =>
    ['profile', 'activity', from, to] as const,
} as const;
