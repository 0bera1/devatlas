'use client';

import type { ReactNode } from 'react';

export interface ResourceGroupProps {
  readonly title: string;
  readonly count: number;
  readonly children: ReactNode;
}

export function ResourceGroup(props: ResourceGroupProps): ReactNode {
  const { title, count, children } = props;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {title}
        </h3>
        <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--muted)]">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}
