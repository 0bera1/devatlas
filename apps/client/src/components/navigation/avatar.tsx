'use client';

import type { ReactNode } from 'react';

export interface AvatarProps {
  readonly initials: string;
  readonly className?: string;
}

export function Avatar({ initials, className }: AvatarProps): ReactNode {
  const text: string = initials.trim().length > 0 ? initials.trim().toUpperCase() : '?';

  return (
    <span
      aria-hidden
      className={`inline-flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-full border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200 text-xs font-semibold tracking-wide text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:from-zinc-50 hover:to-zinc-100 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:from-zinc-700 dark:hover:to-zinc-800${
        className !== undefined ? ` ${className}` : ''
      }`}
    >
      {text}
    </span>
  );
}
