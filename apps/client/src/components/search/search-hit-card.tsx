'use client';

import { useInterviewPrepCategoryLabel } from '@/hooks/knowledge/use-interview-prep-category-label';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { PublicSearchHit } from '@/domains/search/searchDomains';
import { formatUserDisplayName } from '@/lib/user/format-user-display-name';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface SearchHitCardProps {
  readonly hit: PublicSearchHit;
}

export function SearchHitCard(props: SearchHitCardProps): ReactNode {
  const { hit } = props;
  const { t } = useTranslations();
  const categoryLabel = useInterviewPrepCategoryLabel();

  switch (hit.kind) {
    case 'document': {
      const displayName: string = formatUserDisplayName(
        hit.author.firstName,
        hit.author.lastName,
      );
      const authorLabel: string =
        displayName.length > 0 ? displayName : hit.author.email;
      return (
        <Link
          href={`/documents/${hit.id}`}
          className="block rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
              {t('search.kindDocument')}
            </span>
            <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
              {hit.title}
            </h2>
          </div>
          {hit.preview.length > 0 ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {hit.preview}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {t('search.author')}:{' '}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {authorLabel}
              </span>
            </span>
            <span>
              {t('documents.engagement.favorites')}: {hit.favoriteCount}
            </span>
          </div>
        </Link>
      );
    }
    case 'diagram': {
      const displayName: string = formatUserDisplayName(
        hit.author.firstName,
        hit.author.lastName,
      );
      const authorLabel: string =
        displayName.length > 0 ? displayName : hit.author.email;
      return (
        <Link
          href={`/diagrams/${hit.id}`}
          className="block rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-violet-200 hover:bg-violet-50/50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-violet-900 dark:hover:bg-violet-950/20"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-900 dark:bg-violet-950/60 dark:text-violet-200">
              {t('search.kindDiagram')}
            </span>
            <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
              {hit.title}
            </h2>
          </div>
          {hit.preview.length > 0 ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {hit.preview}
            </p>
          ) : null}
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            {t('search.author')}:{' '}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {authorLabel}
            </span>
          </div>
        </Link>
      );
    }
    case 'knowledge_document':
      return (
        <Link
          href={`/knowledge/documents/${hit.slug}`}
          className="block rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-900 dark:bg-sky-950/60 dark:text-sky-200">
              {t('search.kindKnowledgeDocument')}
            </span>
            <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
              {hit.title}
            </h2>
          </div>
          {hit.preview.length > 0 ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {hit.preview}
            </p>
          ) : null}
        </Link>
      );
    case 'knowledge_diagram':
      return (
        <Link
          href={`/knowledge/diagrams/${hit.slug}`}
          className="block rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/20"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200">
              {t('search.kindKnowledgeDiagram')}
            </span>
            <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
              {hit.title}
            </h2>
          </div>
          {hit.preview.length > 0 ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {hit.preview}
            </p>
          ) : null}
        </Link>
      );
    case 'knowledge_flow':
      return (
        <Link
          href={`/knowledge/flows/${hit.slug}`}
          className="block rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:hover:border-indigo-800"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-200/80 px-2 py-0.5 text-xs font-medium text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100">
              {t('search.kindKnowledgeFlow')}
            </span>
            <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
              {hit.title}
            </h2>
          </div>
          {hit.preview.length > 0 ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {hit.preview}
            </p>
          ) : null}
        </Link>
      );
    case 'interview_question':
      return (
        <Link
          href={`/knowledge/interview/${hit.slug}`}
          className="block rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
              {t('search.kindInterviewQuestion')}
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {categoryLabel(hit.category)}
            </span>
          </div>
          <h2 className="mt-2 font-semibold leading-snug text-zinc-950 dark:text-zinc-50">
            {hit.title}
          </h2>
          {hit.preview.length > 0 ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {hit.preview}
            </p>
          ) : null}
        </Link>
      );
    default: {
      const _exhaustive: never = hit;
      return _exhaustive;
    }
  }
}
