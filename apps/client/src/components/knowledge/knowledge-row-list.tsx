'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export interface KnowledgeRow {
  readonly key: string;
  readonly href: string;
  readonly title: string;
  readonly description: string | null;
  /** Sağdaki kısa bilgi, örneğin "6 düğüm" ya da "4 adım". */
  readonly meta: string | null;
  /** Başlığın yanındaki küçük etiket, örneğin "Senaryo". */
  readonly badge: string | null;
}

export interface KnowledgeRowListProps {
  readonly rows: readonly KnowledgeRow[];
  readonly isPending: boolean;
  readonly errorMessage: string | null;
  readonly emptyMessage: string;
  readonly footer?: ReactNode;
}

/** Bilgi tabanı listeleri için ortak satır düzeni: kural çizgileri, serif başlık, sağda sayı. */
export function KnowledgeRowList(props: KnowledgeRowListProps): ReactNode {
  const { rows, isPending, errorMessage, emptyMessage, footer } = props;

  if (isPending) {
    return (
      <div className="animate-pulse space-y-3">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-16 rounded bg-[var(--border)]" />
        ))}
      </div>
    );
  }

  if (errorMessage !== null) {
    return <p className="rounded-xl border border-red-300/60 px-4 py-3 text-sm text-red-700 dark:text-red-300">{errorMessage}</p>;
  }

  if (rows.length === 0) {
    return <p className="border-y border-[var(--border)] py-12 text-center text-sm text-[var(--muted)]">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col">
      <ul className="border-t border-[var(--border)]">
        {rows.map((row) => (
          <li key={row.key} className="border-b border-[var(--border)]">
            <Link href={row.href} className="group grid gap-x-6 gap-y-1 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline">
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-serif text-xl leading-snug group-hover:underline group-hover:underline-offset-4">{row.title}</span>
                  {row.badge !== null ? (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{row.badge}</span>
                  ) : null}
                </p>
                {row.description !== null && row.description.length > 0 ? (
                  <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">{row.description}</p>
                ) : null}
              </div>
              {row.meta !== null ? <span className="text-sm tabular-nums text-[var(--muted)]">{row.meta}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
      {footer !== undefined ? <div className="pt-4">{footer}</div> : null}
    </div>
  );
}
