'use client';

import { KnowledgeDocumentDetailView } from '@/components/knowledge/knowledge-document-detail-view';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

export default function KnowledgeDocumentPage(): ReactNode {
  const params = useParams();
  const slug: string =
    typeof params.slug === 'string' ? params.slug : '';

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <KnowledgeDocumentDetailView slug={slug} />
    </div>
  );
}
