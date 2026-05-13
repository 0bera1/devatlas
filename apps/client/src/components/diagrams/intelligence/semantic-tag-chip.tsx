'use client';

import type { ReactNode } from 'react';

export interface SemanticTagChipProps {
  readonly label: string;
}

export function SemanticTagChip(props: SemanticTagChipProps): ReactNode {
  const { label } = props;
  return (
    <span className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700 dark:bg-violet-950/50 dark:text-violet-200">
      {label}
    </span>
  );
}
