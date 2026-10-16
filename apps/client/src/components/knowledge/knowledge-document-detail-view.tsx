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
        <div className="h-8 w-2/3 rounded-lg bg-[var(--border)]" />
        <div className="h-48 rounded-2xl bg-[var(--border)]" />
      </div>
    );
  }

  if (errorMessage !== null || data === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-red-700 dark:text-red-300">
          {errorMessage ?? t('knowledge.document.notFound')}
        </p>
        <KnowledgeBackLink className="text-sm font-medium text-[var(--foreground)] underline" />
      </div>
    );
  }

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <KnowledgeBackLink />
        <h1 className="font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
          {data.title}
        </h1>
        <span className="inline-flex w-fit rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
          {t('knowledge.readOnly')}
        </span>
      </header>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <MarkdownSafePreview
          content={data.content}
          className="text-sm leading-relaxed text-[var(--foreground)]"
        />
      </div>
      <RelatedInterviewQuestions questions={data.relatedInterviewQuestions} />
    </article>
  );
}
