'use client';

import type { RelatedInterviewQuestion } from '@/domains/intelligenceDomains';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { InterviewQuestionCard } from './interview-question-card';

export interface InterviewQuestionsListProps {
  readonly questions: readonly RelatedInterviewQuestion[];
  readonly documentTags: readonly string[];
}

export function InterviewQuestionsList({
  questions,
  documentTags,
}: InterviewQuestionsListProps): ReactNode {
  const matchingTagSet: ReadonlySet<string> = useMemo((): ReadonlySet<string> => {
    return new Set<string>(
      documentTags.map((tag: string) => tag.trim().toLowerCase()),
    );
  }, [documentTags]);

  return (
    <div className="flex flex-col gap-2">
      {questions.map((question: RelatedInterviewQuestion) => (
        <InterviewQuestionCard
          key={question.id}
          question={question}
          matchingTagSet={matchingTagSet}
        />
      ))}
    </div>
  );
}
