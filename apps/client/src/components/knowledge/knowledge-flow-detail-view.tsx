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

export function KnowledgeFlowDetailView(
  props: KnowledgeFlowDetailViewProps,
): ReactNode {
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
        <div className="h-8 w-1/2 rounded-lg bg-[var(--border)]" />
        <div className="h-32 rounded-2xl bg-[var(--border)]" />
        <div className="h-[420px] rounded-2xl bg-[var(--border)]" />
      </div>
    );
  }

  if (errorMessage !== null || data === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-red-700 dark:text-red-300">
          {errorMessage ?? t('knowledge.flow.notFound')}
        </p>
        <KnowledgeBackLink className="text-sm font-medium underline" />
      </div>
    );
  }

  const steps: KnowledgeFlowStepRecord[] = data.steps;
  const activeStep: KnowledgeFlowStepRecord | undefined =
    steps[activeStepIndex];
  const activeSlug: string = activeStep?.diagramSlug ?? '';

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <KnowledgeBackLink className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]" />
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            {data.title}
          </h1>
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
            {steps.length} {t('knowledge.flow.stepsLabel')}
          </span>
        </div>
        {data.description !== null && data.description.length > 0 ? (
          <p className="text-sm font-medium text-[var(--foreground)]">
            {data.description}
          </p>
        ) : null}
        <p className="text-sm text-[var(--muted)]">
          {t('knowledge.flow.howToRead')}
        </p>
      </header>

      <KnowledgeNarrativeSection narrative={data.narrative} variant="flow" />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          {t('knowledge.flow.stepsHeading')}
        </h2>
        <ol className="flex flex-col gap-2">
          {steps.map((step: KnowledgeFlowStepRecord, index: number) => {
            const isActive: boolean = index === activeStepIndex;
            const isDone: boolean = index < activeStepIndex;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStepIndex(index);
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/70'
                      : isDone
                        ? 'border-[var(--border)] bg-[var(--surface)] opacity-90'
                        : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border)] hover:bg-[var(--surface)] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/50'
                  }`}
                >
                  <span className="font-semibold text-[var(--foreground)]">
                    {step.label}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    {t('knowledge.flow.diagramRef')}: {step.diagramTitle}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {activeSlug.length > 0 ? (
        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              {activeStep?.diagramTitle}
            </h2>
            <Link
              href={`/knowledge/diagrams/${activeSlug}`}
              className="text-xs font-medium text-indigo-700 underline dark:text-indigo-300"
            >
              {t('knowledge.flow.openDiagramOnly')}
            </Link>
          </div>
          <KnowledgeDiagramReadonlyView
            slug={activeSlug}
            showHeader={false}
            showNarrative={false}
          />
          <KnowledgeNarrativeSection
            narrative={activeStep?.narrative}
            variant="step"
          />
        </section>
      ) : null}

      <RelatedInterviewQuestions questions={data.relatedInterviewQuestions} />

      <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          disabled={activeStepIndex <= 0}
          onClick={() => {
            setActiveStepIndex((i: number) => Math.max(0, i - 1));
          }}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-40"
        >
          {t('knowledge.flow.prev')}
        </button>
        <span className="flex items-center px-2 text-sm text-[var(--muted)]">
          {activeStepIndex + 1} / {steps.length}
        </span>
        <button
          type="button"
          disabled={activeStepIndex >= steps.length - 1}
          onClick={() => {
            setActiveStepIndex((i: number) =>
              Math.min(steps.length - 1, i + 1),
            );
          }}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-40"
        >
          {t('knowledge.flow.next')}
        </button>
      </div>
    </div>
  );
}
