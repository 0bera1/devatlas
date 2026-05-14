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
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
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
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          {t('documents.interviewQuestions.scoreLabel')}: {question.score}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">
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
        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-zinc-50/80 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
          {question.answer}
        </pre>
      ) : null}
    </article>
  );
}
