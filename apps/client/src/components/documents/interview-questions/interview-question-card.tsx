'use client';

import type { RelatedInterviewQuestion } from '@/domains/intelligence/intelligenceDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { InterviewQuestionDifficultyBadge } from './interview-question-difficulty-badge';
import { InterviewQuestionTagChip } from './interview-question-tag-chip';

export interface InterviewQuestionCardProps {
  readonly question: RelatedInterviewQuestion;
  readonly matchingTagSet: ReadonlySet<string>;
}

export function InterviewQuestionCard({
  question,
  matchingTagSet,
}: InterviewQuestionCardProps): ReactNode {
  const { t } = useTranslations();
  const [revealed, setRevealed] = useState<boolean>(false);

  const onToggle = useCallback((): void => {
    setRevealed((prev: boolean) => !prev);
  }, []);

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <InterviewQuestionDifficultyBadge difficulty={question.difficulty} />
          {question.tags.map((tag: string) => (
            <InterviewQuestionTagChip
              key={tag}
              tag={tag}
              highlighted={matchingTagSet.has(tag.trim().toLowerCase())}
            />
          ))}
        </div>
        <span className="text-[11px] font-medium text-[var(--muted)]">
          {t('documents.interviewQuestions.scoreLabel')}: {question.score}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
        {question.question}
      </p>

      <button
        type="button"
        onClick={onToggle}
        className="mt-2 text-xs font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-300"
        aria-expanded={revealed}
      >
        {revealed
          ? t('documents.interviewQuestions.hideAnswer')
          : t('documents.interviewQuestions.showAnswer')}
      </button>

      {revealed ? (
        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-[var(--surface)]/80 px-3 py-2 font-mono text-xs leading-relaxed text-[var(--foreground)]">
          {question.answer}
        </pre>
      ) : null}
    </article>
  );
}
