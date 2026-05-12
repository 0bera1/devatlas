'use client';

import { createAppQueryClient } from '@/api/query/create-app-query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }): ReactNode {
  const [client] = useState(() => createAppQueryClient());

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
