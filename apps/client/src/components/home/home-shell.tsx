'use client';

import { Navbar } from '@/components/home/navbar';
import type { ReactNode } from 'react';

export type HomeShellVariant = 'default' | 'cinematic';

export interface HomeShellProps {
  readonly children: ReactNode;
  /** `cinematic`: ana sayfa scroll sahnesi; tema `ThemeProvider` ile açık/koyu uyumlu */
  readonly variant?: HomeShellVariant;
}

export function HomeShell(props: HomeShellProps): ReactNode {
  const { children, variant = 'default' } = props;
  const isCinematic: boolean = variant === 'cinematic';

  const shellClass: string = isCinematic
    ? 'relative flex min-h-full flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100'
    : 'relative flex min-h-full flex-1 flex-col bg-gradient-to-b from-zinc-50 via-white to-zinc-50/90 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950';

  const glowClass: string = isCinematic
    ? 'pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_78%_56%_at_50%_-10%,rgba(139,92,246,0.14),transparent_58%)] dark:bg-[radial-gradient(ellipse_75%_55%_at_50%_-12%,rgba(99,102,241,0.22),transparent_58%)]'
    : 'pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_55%_at_50%_-8%,rgba(167,139,250,0.12),transparent_55%)]';

  return (
    <div className={shellClass}>
      <div className={glowClass} aria-hidden />
      <div className="relative z-0 flex min-h-full flex-1 flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
