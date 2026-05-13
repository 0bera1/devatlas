'use client';

import type { ReactNode } from 'react';

export interface IntelligenceErrorMessageProps {
  readonly message: string;
}

export function IntelligenceErrorMessage(
  props: IntelligenceErrorMessageProps,
): ReactNode {
  const { message } = props;
  return (
    <p className="mt-3 text-sm text-red-600 dark:text-red-400">{message}</p>
  );
}
