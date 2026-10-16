'use client';

import { KnowledgeInterviewDetailView } from '@/components/knowledge/interview/knowledge-interview-detail-view';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

export default function KnowledgeInterviewQuestionPage(): ReactNode {
  const params = useParams();
  const slug: string =
    typeof params.slug === 'string' ? params.slug : '';

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 lg:py-14">
      <KnowledgeInterviewDetailView slug={slug} />
    </div>
  );
}
