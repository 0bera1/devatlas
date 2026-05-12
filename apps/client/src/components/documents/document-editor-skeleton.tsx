import type { ReactNode } from 'react';

export function DocumentEditorSkeleton(): ReactNode {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10 lg:py-14">
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(260px,320px)] lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="h-32 w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="min-h-[320px] w-full flex-1 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="hidden min-h-[280px] animate-pulse rounded-2xl bg-zinc-200 lg:block dark:bg-zinc-800" />
      </div>
    </main>
  );
}
