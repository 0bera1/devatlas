'use client';

import { KnowledgeDiagramReadonlyView } from '@/components/knowledge/knowledge-diagram-readonly-view';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

export default function KnowledgeDiagramPage(): ReactNode {
  const params = useParams();
  const slug: string =
    typeof params.slug === 'string' ? params.slug : '';

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 lg:py-14">
      <KnowledgeDiagramReadonlyView slug={slug} />
    </main>
  );
}
