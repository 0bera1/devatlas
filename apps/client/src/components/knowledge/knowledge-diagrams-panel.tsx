'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { buildKnowledgeNarrativeExcerpt } from '@/components/knowledge/knowledge-narrative-excerpt';
import type { KnowledgeDiagramSummary } from '@/domains/knowledge/knowledgeDomains';
import { useKnowledgeDiagramsQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export function KnowledgeDiagramsPanel(): ReactNode {
  const { t } = useTranslations();
  const { data, isPending, isError, error } = useKnowledgeDiagramsQuery();

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const diagrams: KnowledgeDiagramSummary[] = data ?? [];

  if (isPending) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-20 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-20 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (errorMessage !== null) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
        {errorMessage}
      </p>
    );
  }

  if (diagrams.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        {t('knowledge.diagrams.empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {diagrams.map((row: KnowledgeDiagramSummary) => {
        const excerpt: string | null = buildKnowledgeNarrativeExcerpt(row.narrative);
        return (
          <li key={row.id}>
            <Link
              href={`/knowledge/diagrams/${row.slug}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {row.title}
                </h3>
                {excerpt !== null ? (
                  <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                    {t('knowledge.narrative.badge')}
                  </span>
                ) : null}
              </div>
              {row.description !== null && row.description.length > 0 ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {row.description}
                </p>
              ) : null}
              {excerpt !== null ? (
                <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {excerpt}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {row.nodeCount} {t('knowledge.diagrams.nodesLabel')}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
