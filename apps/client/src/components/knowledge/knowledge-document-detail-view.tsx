'use client';

import { isHttpNetworkError, isNotFoundHttpError } from '@/api/http/execute-request';
import { KnowledgeBackLink } from '@/components/knowledge/knowledge-back-link';
import { KnowledgeMarkdownContent } from '@/components/knowledge/knowledge-markdown-content';
import { RelatedInterviewQuestions } from '@/components/knowledge/related-interview-questions';
import { useKnowledgeDocumentQuery } from '@/features/knowledge/queries/useKnowledgeQueries';
import { useFormatDocumentDate } from '@/hooks/documents/use-format-document-date';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { extractMarkdownHeadings, type MarkdownHeading } from '@/lib/strings/markdown-blocks';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

interface KnowledgeDocumentDetailViewProps {
  readonly slug: string;
}

/**
 * Bilgi tabanı dokümanı: solda "Bu sayfada" içindekiler, ortada serif makale, altta bağlı sorular.
 */
export function KnowledgeDocumentDetailView(props: KnowledgeDocumentDetailViewProps): ReactNode {
  const { slug } = props;
  const { t } = useTranslations();
  const formatDate = useFormatDocumentDate();
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

  const headings: readonly MarkdownHeading[] = useMemo(() => (data === undefined ? [] : extractMarkdownHeadings(data.content)), [data]);

  if (isPending) {
    return (
      <div className="mx-auto max-w-[640px] animate-pulse space-y-4">
        <div className="h-4 w-40 rounded bg-[var(--border)]" />
        <div className="h-12 w-3/4 rounded bg-[var(--border)]" />
        <div className="h-64 rounded bg-[var(--border)]" />
      </div>
    );
  }

  if (errorMessage !== null || data === undefined) {
    return (
      <div className="mx-auto flex max-w-[640px] flex-col gap-4">
        <p className="text-sm text-red-700 dark:text-red-300">{errorMessage ?? t('knowledge.document.notFound')}</p>
        <KnowledgeBackLink className="text-sm font-medium text-[var(--foreground)] underline" />
      </div>
    );
  }

  const relatedCount: number = data.relatedInterviewQuestions.length;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--muted)]">
        <span className="flex items-center gap-2">
          <KnowledgeBackLink className="text-[var(--muted)] hover:text-[var(--foreground)]" />
          <span aria-hidden>/</span>
          <span className="truncate text-[var(--foreground)]">{data.title}</span>
        </span>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">{t('knowledge.readOnly')}</span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] justify-center gap-14 lg:grid-cols-[180px_minmax(0,640px)]">
        {headings.length > 0 ? (
          <nav aria-label={t('documents.toc')} className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-2.5 pt-24 text-[13px] text-[var(--muted)]">
              <span className="text-[11px] uppercase tracking-[0.08em]">{t('documents.toc')}</span>
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={`hover:text-[var(--foreground)] ${heading.level === 3 ? 'pl-3' : ''}`}
                >
                  {heading.text}
                </a>
              ))}
            </div>
          </nav>
        ) : (
          <div className="hidden lg:block" />
        )}

        <article className="flex min-w-0 flex-col">
          <p className="text-[13px] text-[var(--muted)]">
            {t('knowledge.interview.resourceKind.document')}
            {relatedCount > 0 ? ` · ${relatedCount} ${t('knowledge.relatedInterviewQuestions').toLocaleLowerCase()}` : ''}
          </p>
          <h1 className="mt-3.5 font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-[52px]">{data.title}</h1>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-y border-[var(--border)] py-3 text-[13px] text-[var(--muted)]">
            <span>
              {t('documents.editor.lastUpdated')}: <span className="text-[var(--foreground)]">{formatDate(data.updatedAt)}</span>
            </span>
          </div>

          {data.summary !== null && data.summary.length > 0 ? (
            <p className="mt-7 font-serif text-xl leading-relaxed text-[var(--foreground)]">{data.summary}</p>
          ) : null}

          <div className="mt-7">
            <KnowledgeMarkdownContent content={data.content} variant="article" />
          </div>

          <div className="mt-14">
            <RelatedInterviewQuestions questions={data.relatedInterviewQuestions} />
          </div>
        </article>
      </div>
    </div>
  );
}
