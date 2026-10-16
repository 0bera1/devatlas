'use client';

import { apiClient } from '@/api/http/api-client';
import { useAuth } from '@/components/providers/auth-provider';
import { useRequireAuth } from '@/hooks/auth/use-require-auth';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

type SearchType = 'all' | 'document' | 'diagram';
type SearchSort = 'relevance' | 'recent';

interface LibraryHit {
  type: 'document' | 'diagram';
  id: string;
  title: string;
  snippet: string;
  ownerId: string;
  updatedAt: string;
  score: number;
}

const TYPE_OPTIONS: ReadonlyArray<{ value: SearchType; label: MessageKey }> = [
  { value: 'all', label: 'search.library.type.all' },
  { value: 'document', label: 'search.library.type.document' },
  { value: 'diagram', label: 'search.library.type.diagram' },
];

export function LibrarySearchView(): ReactNode {
  const { canRender } = useRequireAuth();
  if (!canRender) {
    return null;
  }
  return <LibrarySearchContent />;
}

function LibrarySearchContent(): ReactNode {
  const { t } = useTranslations();
  const { token } = useAuth();
  const [query, setQuery] = useState<string>('');
  const [debounced, setDebounced] = useState<string>('');
  const [type, setType] = useState<SearchType>('all');
  const [sort, setSort] = useState<SearchSort>('relevance');
  const [tag, setTag] = useState<string>('');
  const [hits, setHits] = useState<LibraryHit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);

  // Her tuş vuruşunda istek atmamak için kısa bir gecikme.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (token === null) {
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({ sort, type, limit: '30' });
    if (debounced.length > 0) {
      params.set('q', debounced);
    }
    if (tag.trim().length > 0) {
      params.set('tag', tag.trim());
    }
    setLoading(true);
    setFailed(false);
    void (async () => {
      try {
        const response = await apiClient.get<LibraryHit[]>(`/search/library?${params.toString()}`, {
          accessToken: token,
        });
        if (!cancelled) {
          setHits(response.data);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setHits([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, debounced, type, sort, tag]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 text-[var(--foreground)] sm:px-6">
      <h1 className="font-serif text-4xl font-medium tracking-tight">{t('search.library.title')}</h1>

      <div className="mt-6 space-y-4">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('search.library.placeholder')}
          aria-label={t('search.library.placeholder')}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        />

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={type === option.value}
              onClick={() => setType(option.value)}
              className={`rounded-full border px-3.5 py-1.5 ${
                type === option.value
                  ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]'
                  : 'border-[var(--border)]'
              }`}
            >
              {t(option.label)}
            </button>
          ))}
          <input
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder={t('search.library.tag')}
            aria-label={t('search.library.tag')}
            className="ml-auto w-36 rounded-full border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm"
          />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value === 'recent' ? 'recent' : 'relevance')}
            aria-label="sort"
            className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm"
          >
            <option value="relevance">{t('search.library.sort.relevance')}</option>
            <option value="recent">{t('search.library.sort.recent')}</option>
          </select>
        </div>
      </div>

      <section className="mt-8">
        {failed ? <p className="text-sm text-red-700">{t('search.library.error')}</p> : null}
        {!failed && !loading && hits.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t('search.library.empty')}</p>
        ) : null}
        <ul className="divide-y divide-[var(--border)]">
          {hits.map((hit) => (
            <li key={`${hit.type}-${hit.id}`} className="py-4">
              <Link href={hit.type === 'document' ? `/documents/${hit.id}` : `/diagrams/${hit.id}`} className="group block">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5">
                    {t(hit.type === 'document' ? 'search.library.type.document' : 'search.library.type.diagram')}
                  </span>
                  <span className="tabular-nums">{new Date(hit.updatedAt).toLocaleDateString()}</span>
                </div>
                <h2 className="mt-1.5 font-serif text-xl group-hover:underline">{hit.title}</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  <Snippet text={hit.snippet} />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/**
 * Sunucudan gelen özeti güvenli biçimde gösterir. `<b>` işaretleri vurgu olarak
 * çevrilir; diğer her metin React tarafından kaçışlanır, HTML olarak yorumlanmaz.
 */
function Snippet(props: { text: string }): ReactNode {
  const parts: string[] = props.text.split(/(<\/?b>)/);
  let highlighted = false;
  return parts.map((part, index) => {
    if (part === '<b>') {
      highlighted = true;
      return null;
    }
    if (part === '</b>') {
      highlighted = false;
      return null;
    }
    if (part.length === 0) {
      return null;
    }
    return highlighted ? (
      <mark key={index} className="rounded bg-amber-200/70 px-0.5 text-inherit dark:bg-amber-500/30">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    );
  });
}
