export const systemContentQueryKeys = {
  all: ['system-content'] as const,
  list: (): readonly ['system-content', 'list'] =>
    [...systemContentQueryKeys.all, 'list'] as const,
} as const;
