'use client';

import { HomeShell } from '@/components/home/home-shell';
import { DocumentsListView } from '@/components/documents/documents-list-view';
import type { ReactNode } from 'react';

export default function DocumentsPage(): ReactNode {
  return (
    <HomeShell>
      <DocumentsListView />
    </HomeShell>
  );
}
