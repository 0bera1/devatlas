'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useAuth } from '@/components/providers/auth-provider';
import { usePublicFeedQuery } from '@/features/documents/queries/useDocument';
import { useFormatDocumentDate } from '@/hooks/documents/use-format-document-date';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { DocumentRecord } from '@/domains/documents/documentsDomains';
import type { MessageKey } from '@/i18n';
import { markdownExcerpt } from '@/lib/strings/markdown-excerpt';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

type FeedMode = 'latest' | 'trending';

interface TopicCount {
  readonly name: string;
  readonly count: number;
}

/** Akıştaki kategorileri içerik sayısına göre sıralar. */
function countTopics(items: readonly DocumentRecord[]): TopicCount[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.category !== null) {
      counts.set(item.category.name, (counts.get(item.category.name) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Keşif: topluluk içeriği. Üstte öne çıkan bir içerik, altında yeni eklenenler ve konular. */
export function PublicFeedView(): ReactNode {
  const { t } = useTranslations();
  const formatDate = useFormatDocumentDate();
  const { token, isReady } = useAuth();
  const loggedIn: boolean = isReady && token !== null;

  const [feedMode, setFeedMode] = useState<FeedMode>('latest');
  const [topic, setTopic] = useState<string | null>(null);
  const { data, isPending, isError, error } = usePublicFeedQuery(feedMode);

  const errorMessage = useMemo((): string | null => {
    if (!isError || error === null) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const allItems: readonly DocumentRecord[] = useMemo((): readonly DocumentRecord[] => data ?? [], [data]);
  const topics: TopicCount[] = useMemo(() => countTopics(allItems), [allItems]);
  const items: readonly DocumentRecord[] = topic === null ? allItems : allItems.filter((item) => item.category?.name === topic);
  const [featured, ...rest] = items;

  const modes: Array<{ value: FeedMode; label: string }> = [
    { value: 'latest', label: t('explore.feedLatest') },
    { value: 'trending', label: t('explore.feedTrending') },
  ];

  const chip = (key: string, label: string, active: boolean, onSelect: () => void): ReactNode => (
    <button
      key={key}
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`rounded-full px-3 py-1.5 text-[13px] transition-colors ${
        active ? 'bg-[var(--foreground)] font-semibold text-[var(--background)]' : 'border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--muted)]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">{t('explore.eyebrow')}</p>
          <h1 className="mt-1.5 font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{t('explore.title')}</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">{t('explore.intro')}</p>
          {!loggedIn && isReady ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {t('explore.hintLogin')}{' '}
              <Link href="/login" className="font-medium text-[var(--foreground)] underline underline-offset-4">
                {t('nav.login')}
              </Link>
            </p>
          ) : null}
        </div>
        <div role="tablist" className="inline-flex w-fit overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)] text-[13px]">
          {modes.map((mode) => {
            const selected: boolean = feedMode === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setFeedMode(mode.value);
                }}
                className={selected ? 'bg-[var(--foreground)] px-4 py-2 font-semibold text-[var(--background)]' : 'px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)]'}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </header>

      {topics.length > 0 ? (
        <div className="mt-8 flex flex-wrap items-center gap-2 border-y border-[var(--border)] py-3.5">
          <span className="mr-1 text-[13px] text-[var(--muted)]">{t('knowledge.table.topic')}</span>
          {chip('all', t('knowledge.interview.allCategories'), topic === null, () => setTopic(null))}
          {topics.map((entry) => chip(entry.name, entry.name, topic === entry.name, () => setTopic(entry.name)))}
        </div>
      ) : (
        <div className="mt-8 border-t border-[var(--border)]" />
      )}

      {errorMessage !== null ? (
        <p className="mt-8 rounded-xl border border-red-300/60 px-4 py-3 text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
      ) : null}

      {isPending ? (
        <div className="mt-10 grid animate-pulse gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="h-4 w-40 rounded bg-[var(--border)]" />
            <div className="h-10 w-3/4 rounded bg-[var(--border)]" />
            <div className="h-20 rounded bg-[var(--border)]" />
          </div>
          <div className="h-56 rounded-xl bg-[var(--border)]" />
        </div>
      ) : featured === undefined ? (
        <p className="py-16 text-center text-sm text-[var(--muted)]">{t('explore.empty')}</p>
      ) : (
        <>
          <FeaturedItem item={featured} t={t} formatDate={formatDate} />

          <section className="grid grid-cols-[minmax(0,1fr)] gap-12 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <div className="flex items-baseline justify-between border-b border-[var(--foreground)] pb-3">
                <h2 className="text-[15px] font-semibold">{feedMode === 'latest' ? t('explore.recent') : t('explore.feedTrending')}</h2>
                <span className="text-xs tabular-nums text-[var(--muted)]">{items.length}</span>
              </div>
              {rest.length === 0 ? (
                <p className="py-8 text-sm text-[var(--muted)]">{t('explore.empty')}</p>
              ) : (
                <ul>
                  {rest.map((doc) => (
                    <li key={doc.id} className="border-b border-[var(--border)]">
                      <Link href={`/documents/${doc.id}`} className="group grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-4">
                        <div className="min-w-0">
                          <p className="font-serif text-[19px] leading-snug group-hover:underline group-hover:underline-offset-4">{doc.title}</p>
                          <p className="mt-1.5 text-xs text-[var(--muted)]">
                            {[t('search.kindDocument'), doc.category?.name, formatDate(doc.updatedAt)].filter((part) => part !== undefined && part !== null).join(' · ')}
                          </p>
                        </div>
                        <span className="whitespace-nowrap text-xs tabular-nums text-[var(--muted)]">
                          {doc.viewCount} {t('documents.engagement.views')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between border-b border-[var(--foreground)] pb-3">
                <h2 className="text-[15px] font-semibold">{t('knowledge.topics')}</h2>
                <span className="text-xs tabular-nums text-[var(--muted)]">{topics.length}</span>
              </div>
              {topics.length === 0 ? (
                <p className="py-8 text-sm text-[var(--muted)]">{t('explore.empty')}</p>
              ) : (
                <ul>
                  {topics.map((entry) => (
                    <li key={entry.name} className="border-b border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() => setTopic(topic === entry.name ? null : entry.name)}
                        aria-pressed={topic === entry.name}
                        className={`grid w-full grid-cols-[1fr_auto] py-3 text-left text-sm transition-colors hover:text-[var(--accent)] ${topic === entry.name ? 'font-semibold' : ''}`}
                      >
                        <span>{entry.name}</span>
                        <span className="tabular-nums text-[var(--muted)]">{entry.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

interface FeaturedItemProps {
  readonly item: DocumentRecord;
  readonly t: (key: MessageKey) => string;
  readonly formatDate: (iso: string) => string;
}

/** Öne çıkan içerik: solda başlık ve özet, sağda içeriğin ilk satırlarından bir önizleme. */
function FeaturedItem(props: FeaturedItemProps): ReactNode {
  const { item, t, formatDate } = props;
  const excerpt: string = markdownExcerpt(item.content, 260);
  const preview: string = markdownExcerpt(item.content, 520);

  return (
    <section className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 border-b border-[var(--border)] py-9 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14">
      <div className="flex flex-col gap-4">
        <p className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          <span className="font-bold uppercase tracking-[0.08em] text-[var(--accent)]">{t('explore.featured')}</span>
          <span aria-hidden>·</span>
          <span>{t('search.kindDocument')}</span>
          {item.category !== null ? (
            <>
              <span aria-hidden>·</span>
              <span>{item.category.name}</span>
            </>
          ) : null}
        </p>
        <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl">{item.title}</h2>
        {excerpt.length > 0 ? <p className="text-[15px] leading-relaxed text-[var(--foreground)]">{excerpt}</p> : null}
        <p className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] tabular-nums text-[var(--muted)]">
          <span>
            {item.viewCount} {t('documents.engagement.views')}
          </span>
          <span>
            {item.favoriteCount} {t('documents.engagement.favorites')}
          </span>
          <span>
            {t('explore.updated')}: {formatDate(item.updatedAt)}
          </span>
        </p>
        <div className="mt-1 flex gap-3">
          <Link href={`/documents/${item.id}`} className="rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90">
            {t('explore.read')}
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:18px_18px]"
          aria-hidden
        />
        <p className="relative font-serif text-lg font-medium">{item.title}</p>
        <p className="relative mt-3 line-clamp-[8] font-serif text-[15px] leading-relaxed text-[var(--muted)]">{preview}</p>
      </div>
    </section>
  );
}
