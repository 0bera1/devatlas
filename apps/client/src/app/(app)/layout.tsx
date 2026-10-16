import { AppShell } from '@/components/shell/app-shell';
import type { ReactNode } from 'react';

export default function AppGroupLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  return <AppShell>{children}</AppShell>;
}
