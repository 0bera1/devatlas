import { HomeShell } from '@/components/home/home-shell';
import type { ReactNode } from 'react';

export default function AppGroupLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  return <HomeShell>{children}</HomeShell>;
}
