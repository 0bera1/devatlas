'use client';

import { Navbar } from '@/components/home/navbar';
import type { ReactNode } from 'react';

export function HomeShell({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-gradient-to-b from-zinc-50 via-white to-zinc-50/90 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_55%_at_50%_-8%,rgba(167,139,250,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-0 flex min-h-full flex-1 flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
