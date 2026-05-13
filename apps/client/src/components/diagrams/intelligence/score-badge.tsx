'use client';

import type { ReactNode } from 'react';

export interface ScoreBadgeProps {
  readonly label: string;
  readonly score: number;
}

export function ScoreBadge(props: ScoreBadgeProps): ReactNode {
  const { label, score } = props;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-950/50 dark:text-violet-200">
      <span>{label}</span>
      <span className="tabular-nums">{score}</span>
    </span>
  );
}
