'use client';

import { KnowledgeFlowDetailView } from '@/components/knowledge/knowledge-flow-detail-view';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

export default function KnowledgeFlowPage(): ReactNode {
  const params = useParams();
  const slug: string =
    typeof params.slug === 'string' ? params.slug : '';

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 lg:py-14">
      <KnowledgeFlowDetailView slug={slug} />
    </main>
  );
}
