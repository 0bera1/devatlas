'use client';

import { isHttpNetworkError, isNotFoundHttpError } from '@/api/http/execute-request';
import { MarkdownSafePreview } from '@/components/diagrams/flow/markdown-safe-preview';
import { KnowledgeBackLink } from '@/components/knowledge/knowledge-back-link';
import { RelatedInterviewQuestions } from '@/components/knowledge/related-interview-questions';
import { useKnowledgeDocumentQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

interface KnowledgeDocumentDetailViewProps {
  readonly slug: string;
}

export function KnowledgeDocumentDetailView(
  props: KnowledgeDocumentDetailViewProps,
): ReactNode {
  const { slug } = props;
  const { t } = useTranslations();
  const { data, isPending, isError, error } = useKnowledgeDocumentQuery(slug, true);

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    if (isNotFoundHttpError(error)) {
      return t('knowledge.document.notFound');
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  if (isPending) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/3 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-48 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (errorMessage !== null || data === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-red-700 dark:text-red-300">
          {errorMessage ?? t('knowledge.document.notFound')}
        </p>
        <KnowledgeBackLink className="text-sm font-medium text-zinc-800 underline dark:text-zinc-200" />
      </div>
    );
  }

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <KnowledgeBackLink />
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {data.title}
        </h1>
        <span className="inline-flex w-fit rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {t('knowledge.readOnly')}
        </span>
      </header>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
        <MarkdownSafePreview
          content={data.content}
          className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200"
        />
      </div>
      <RelatedInterviewQuestions questions={data.relatedInterviewQuestions} />
    </article>
  );
}
