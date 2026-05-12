'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useRelatedDiagramsQuery } from '@/features/diagrams/queries/useDiagram';
import type { DiagramSummary } from '@/domains/diagramDomains';
import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export interface DiagramRelatedSectionProps {
  readonly diagramId: string;
  readonly enabled: boolean;
}

export function DiagramRelatedSection(
  props: DiagramRelatedSectionProps,
): ReactNode {
  const { diagramId, enabled } = props;
  const { t } = useTranslations();

  const { data, isPending, isError, error } = useRelatedDiagramsQuery(
    diagramId,
    enabled,
  );

  const items: DiagramSummary[] = data ?? [];

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {t('diagrams.related.title')}
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {t('diagrams.related.subtitle')}
      </p>
      {errorMessage !== null ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      ) : null}
      {isPending && !isError ? (
        <ul className="mt-4 flex flex-col gap-2">
          {[0, 1, 2].map((i: number) => (
            <li
              key={i}
              className="h-12 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </ul>
      ) : null}
      {!isPending && items.length === 0 && errorMessage === null ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          {t('diagrams.related.empty')}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((d: DiagramSummary) => (
            <li key={d.id}>
              <Link
                href={`/diagrams/${d.id}`}
                className="block rounded-xl border border-zinc-200 px-3 py-2 text-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50"
              >
                <span className="font-medium text-zinc-950 dark:text-zinc-50">
                  {d.title}
                </span>
                <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                  {d.nodeCount} {t('diagrams.list.nodes')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
