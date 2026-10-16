import type { ReactNode } from 'react';

export function DocumentEditorSkeleton(): ReactNode {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] pb-4">
        <div className="h-4 w-28 animate-pulse rounded bg-[var(--border)]" />
        <div className="h-3 w-40 animate-pulse rounded bg-[var(--border)]" />
      </div>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="h-14 w-3/4 animate-pulse rounded bg-[var(--border)]" />
          <div className="min-h-[360px] w-full flex-1 animate-pulse rounded bg-[var(--border)]" />
        </div>
        <div className="hidden min-h-[280px] animate-pulse rounded bg-[var(--border)] lg:block" />
      </div>
    </div>
  );
}
