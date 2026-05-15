'use client';

import { isHttpNetworkError, isNotFoundHttpError } from '@/api/http/execute-request';
import { KnowledgeDiagramReadonlyView } from '@/components/knowledge/knowledge-diagram-readonly-view';
import { KnowledgeNarrativeSection } from '@/components/knowledge/knowledge-narrative-section';
import type { KnowledgeFlowStepRecord } from '@/domains/knowledge/knowledgeDomains';
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
        <div className="h-8 w-1/2 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-[420px] rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (errorMessage !== null || data === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-red-700 dark:text-red-300">
          {errorMessage ?? t('knowledge.flow.notFound')}
        </p>
        <Link href="/knowledge" className="text-sm font-medium underline">
          {t('knowledge.backToBase')}
        </Link>
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
        <Link
          href="/knowledge"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
        >
          {t('knowledge.backToBase')}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            {data.title}
          </h1>
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
            {steps.length} {t('knowledge.flow.stepsLabel')}
          </span>
        </div>
        {data.description !== null && data.description.length > 0 ? (
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {data.description}
          </p>
        ) : null}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t('knowledge.flow.howToRead')}
        </p>
      </header>

      <KnowledgeNarrativeSection narrative={data.narrative} variant="flow" />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
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
                      ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/40'
                      : isDone
                        ? 'border-zinc-200 bg-zinc-50 opacity-90 dark:border-zinc-700 dark:bg-zinc-900/60'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950'
                  }`}
                >
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {step.label}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-600 dark:text-zinc-400">
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
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
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

      <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <button
          type="button"
          disabled={activeStepIndex <= 0}
          onClick={() => {
            setActiveStepIndex((i: number) => Math.max(0, i - 1));
          }}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
        >
          {t('knowledge.flow.prev')}
        </button>
        <span className="flex items-center px-2 text-sm text-zinc-500">
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
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
        >
          {t('knowledge.flow.next')}
        </button>
      </div>
    </div>
  );
}
