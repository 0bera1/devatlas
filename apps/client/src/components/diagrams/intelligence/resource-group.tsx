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
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {title}
        </h3>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}
