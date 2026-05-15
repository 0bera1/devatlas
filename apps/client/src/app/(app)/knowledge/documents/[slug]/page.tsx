'use client';

import { KnowledgeDocumentDetailView } from '@/components/knowledge/knowledge-document-detail-view';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

export default function KnowledgeDocumentPage(): ReactNode {
  const params = useParams();
  const slug: string =
    typeof params.slug === 'string' ? params.slug : '';

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 lg:py-14">
      <KnowledgeDocumentDetailView slug={slug} />
    </main>
  );
}
