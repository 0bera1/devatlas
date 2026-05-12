'use client';

import { AuthShell } from '@/components/auth/auth-shell';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export default function AuthGroupLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  const pathname: string = usePathname();
  const mode: 'login' | 'register' =
    pathname === '/register' ? 'register' : 'login';

  return <AuthShell mode={mode}>{children}</AuthShell>;
}
