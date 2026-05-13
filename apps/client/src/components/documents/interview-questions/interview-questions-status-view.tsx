'use client';

import type {
  DocumentInterviewQuestionsState,
  DocumentInterviewQuestionsStatus,
} from '@/hooks/use-document-interview-questions';
import type { ReactNode } from 'react';
import { InterviewQuestionsEmpty } from './interview-questions-empty';
import { InterviewQuestionsError } from './interview-questions-error';
import { InterviewQuestionsList } from './interview-questions-list';
import { InterviewQuestionsSkeleton } from './interview-questions-skeleton';

export interface InterviewQuestionsStatusViewProps {
  readonly state: DocumentInterviewQuestionsState;
}

export function InterviewQuestionsStatusView({
  state,
}: InterviewQuestionsStatusViewProps): ReactNode {
  const status: DocumentInterviewQuestionsStatus = state.status;
  switch (status) {
    case 'loading':
      return <InterviewQuestionsSkeleton />;
    case 'error':
      return (
        <InterviewQuestionsError
          message={state.errorMessage ?? 'Unknown error'}
        />
      );
    case 'empty':
      return <InterviewQuestionsEmpty />;
    case 'ready':
      if (state.resource === null) {
        return <InterviewQuestionsEmpty />;
      }
      return (
        <InterviewQuestionsList
          questions={state.resource.relatedInterviewQuestions}
          documentTags={state.resource.documentTags}
        />
      );
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
