'use client';

import { KnowledgeInterviewDetailView } from '@/components/knowledge/interview/knowledge-interview-detail-view';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

export default function KnowledgeInterviewQuestionPage(): ReactNode {
  const params = useParams();
  const slug: string =
    typeof params.slug === 'string' ? params.slug : '';

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <KnowledgeInterviewDetailView slug={slug} />
    </div>
  );
}
