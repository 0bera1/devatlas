'use client';

import { useDocumentInterviewQuestions } from '@/hooks/use-document-interview-questions';
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
    <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
      <InterviewQuestionsHeader />
      <InterviewQuestionsStatusView state={state} />
    </section>
  );
}
