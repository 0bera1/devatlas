'use client';

import { useDocumentInterviewQuestions } from '@/hooks/documents/use-document-interview-questions';
import type { ReactNode } from 'react';
import { InterviewQuestionsHeader } from './interview-questions-header';
import { InterviewQuestionsStatusView } from './interview-questions-status-view';

export interface InterviewQuestionsSectionProps {
  readonly documentId: string;
  readonly enabled: boolean;
}

/**
 * Doküman detay sayfasında "ilgili mülakat soruları" bölmesinin orchestrator'ı.
 * Veri ve durum yönetimini `useDocumentInterviewQuestions` hook'una bırakır.
 */
export function InterviewQuestionsSection({
  documentId,
  enabled,
}: InterviewQuestionsSectionProps): ReactNode {
  const state = useDocumentInterviewQuestions(documentId, enabled);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <InterviewQuestionsHeader />
      <InterviewQuestionsStatusView state={state} />
    </section>
  );
}
