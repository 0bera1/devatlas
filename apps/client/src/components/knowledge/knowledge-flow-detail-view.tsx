'use client';

import { isHttpNetworkError, isNotFoundHttpError } from '@/api/http/execute-request';
import { KnowledgeDiagramReadonlyView } from '@/components/knowledge/knowledge-diagram-readonly-view';
import { KnowledgeNarrativeSection } from '@/components/knowledge/knowledge-narrative-section';
import type { KnowledgeFlowStepRecord } from '@/domains/knowledge/knowledgeDomains';
import { KnowledgeBackLink } from '@/components/knowledge/knowledge-back-link';
import { RelatedInterviewQuestions } from '@/components/knowledge/related-interview-questions';
import { useKnowledgeFlowQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

interface KnowledgeFlowDetailViewProps {
  readonly slug: string;
}

/** Bilgi tabanı akışı: solda numaralı adım şeridi, sağda seçili adımın diyagramı ve anlatımı. */
export function KnowledgeFlowDetailView(props: KnowledgeFlowDetailViewProps): ReactNode {
  const { slug } = props;
  const { t } = useTranslations();
  const { data, isPending, isError, error } = useKnowledgeFlowQuery(slug, true);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    if (isNotFoundHttpError(error)) {
      return t('knowledge.flow.notFound');
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  if (isPending) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-40 rounded bg-[var(--border)]" />
        <div className="h-12 w-1/2 rounded bg-[var(--border)]" />
        <div className="h-[420px] rounded-xl bg-[var(--border)]" />
      </div>
    );
  }

  if (errorMessage !== null || data === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-red-700 dark:text-red-300">{errorMessage ?? t('knowledge.flow.notFound')}</p>
        <KnowledgeBackLink className="text-sm font-medium underline" />
      </div>
    );
  }

  const steps: KnowledgeFlowStepRecord[] = data.steps;
  const activeStep: KnowledgeFlowStepRecord | undefined = steps[activeStepIndex];
  const activeSlug: string = activeStep?.diagramSlug ?? '';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--muted)]">
        <span className="flex min-w-0 items-center gap-2">
          <KnowledgeBackLink className="text-[var(--muted)] hover:text-[var(--foreground)]" />
          <span aria-hidden>/</span>
          <span className="truncate text-[var(--foreground)]">{data.title}</span>
        </span>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">{t('knowledge.readOnly')}</span>
      </div>

      <header className="flex flex-col gap-3">
        <p className="text-[13px] text-[var(--muted)]">
          {t('knowledge.interview.resourceKind.flow')} · {steps.length} {t('knowledge.flow.stepsLabel')}
        </p>
        <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">{data.title}</h1>
        {data.description !== null && data.description.length > 0 ? (
          <p className="max-w-2xl text-[15px] leading-relaxed text-[var(--foreground)]">{data.description}</p>
        ) : null}
        <p className="max-w-2xl text-sm text-[var(--muted)]">{t('knowledge.flow.howToRead')}</p>
      </header>

      <KnowledgeNarrativeSection narrative={data.narrative} variant="flow" />

      <section className="grid grid-cols-[minmax(0,1fr)] gap-10 border-t border-[var(--border)] pt-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{t('knowledge.flow.stepsHeading')}</h2>
          <ol className="relative flex flex-col">
            {steps.map((step: KnowledgeFlowStepRecord, index: number) => {
              const isActive: boolean = index === activeStepIndex;
              const isDone: boolean = index < activeStepIndex;
              const isLast: boolean = index === steps.length - 1;
              return (
                <li key={step.id} className="relative pl-10">
                  {!isLast ? (
                    <span
                      className={`absolute left-[13px] top-8 h-[calc(100%-1.25rem)] w-px ${isDone ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={`absolute left-0 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold tabular-nums ${
                      isActive
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]'
                        : isDone
                          ? 'border-[var(--accent)] text-[var(--accent)]'
                          : 'border-[var(--border)] text-[var(--muted)]'
                    }`}
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    aria-current={isActive ? 'step' : undefined}
                    onClick={() => {
                      setActiveStepIndex(index);
                    }}
                    className="w-full pb-6 pt-1 text-left"
                  >
                    <span className={`block font-serif text-lg leading-snug ${isActive ? 'text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}>
                      {step.label}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--muted)]">{step.diagramTitle}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          {activeSlug.length > 0 ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-serif text-2xl font-medium">{activeStep?.diagramTitle}</h2>
                <Link
                  href={`/knowledge/diagrams/${activeSlug}`}
                  className="text-xs font-medium text-[var(--muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline"
                >
                  {t('knowledge.flow.openDiagramOnly')} →
                </Link>
              </div>
              <KnowledgeDiagramReadonlyView slug={activeSlug} showHeader={false} showNarrative={false} />
              <KnowledgeNarrativeSection narrative={activeStep?.narrative} variant="step" />
            </>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
            <button
              type="button"
              disabled={activeStepIndex <= 0}
              onClick={() => {
                setActiveStepIndex((i: number) => Math.max(0, i - 1));
              }}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-40"
            >
              {t('knowledge.flow.prev')}
            </button>
            <span className="px-2 font-mono text-sm tabular-nums text-[var(--muted)]">
              {String(activeStepIndex + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              disabled={activeStepIndex >= steps.length - 1}
              onClick={() => {
                setActiveStepIndex((i: number) => Math.min(steps.length - 1, i + 1));
              }}
              className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {t('knowledge.flow.next')}
            </button>
          </div>
        </div>
      </section>

      <RelatedInterviewQuestions questions={data.relatedInterviewQuestions} />
    </div>
  );
}
