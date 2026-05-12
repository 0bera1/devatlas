import { QueryClient } from '@tanstack/react-query';

export const defaultStaleTimeMs: number = 60_000;

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: defaultStaleTimeMs,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
