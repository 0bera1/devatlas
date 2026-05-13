'use client';

import type { ReactNode } from 'react';

export interface InterviewQuestionsErrorProps {
  readonly message: string;
}

export function InterviewQuestionsError({
  message,
}: InterviewQuestionsErrorProps): ReactNode {
  return (
    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
      {message}
    </p>
  );
}
