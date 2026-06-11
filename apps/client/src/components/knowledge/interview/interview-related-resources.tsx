'use client';

import type {
  InterviewKnowledgeResources,
  KnowledgeResourceRef,
} from '@/domains/knowledge/knowledgeDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

interface InterviewRelatedResourcesProps {
  readonly resources: InterviewKnowledgeResources;
}

type ResourceKind = 'document' | 'diagram' | 'flow';

interface FlatResourceItem {
  readonly slug: string;
  readonly title: string;
  readonly href: string;
  readonly kind: ResourceKind;
  readonly typeLabel: string;
}

interface ResourceCardProps {
  readonly item: FlatResourceItem;
}

function resourceKindBadgeClass(kind: ResourceKind): string {
  switch (kind) {
    case 'document':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200';
    case 'diagram':
      return 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200';
    case 'flow':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function ResourceKindBadge({
  label,
  kind,
}: {
  readonly label: string;
  readonly kind: ResourceKind;
}): ReactNode {
  return (
    <span
      className={`w-fit rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${resourceKindBadgeClass(kind)}`}
    >
      {label}
    </span>
  );
}

function ResourceCard({ item }: ResourceCardProps): ReactNode {
  return (
    <li>
      <Link
        href={item.href}
        className="group flex h-full flex-col gap-3 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/80 dark:hover:border-indigo-800"
      >
        <ResourceKindBadge kind={item.kind} label={item.typeLabel} />
        <span className="flex-1 text-sm font-medium leading-snug text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-300">
          {item.title}
        </span>
        <span
          className="self-end text-sm text-zinc-300 transition-colors group-hover:text-indigo-500 dark:text-zinc-600"
          aria-hidden
        >
          →
        </span>
      </Link>
    </li>
  );
}

function flattenResources(
  resources: InterviewKnowledgeResources,
  labels: Readonly<Record<ResourceKind, string>>,
): readonly FlatResourceItem[] {
  const mapRefs = (
    items: readonly KnowledgeResourceRef[],
    kind: ResourceKind,
    hrefPrefix: string,
  ): FlatResourceItem[] =>
    items.map(
      (item): FlatResourceItem => ({
        slug: item.slug,
        title: item.title,
        href: `${hrefPrefix}/${item.slug}`,
        kind,
        typeLabel: labels[kind],
      }),
    );

  return [
    ...mapRefs(resources.documents, 'document', '/knowledge/documents'),
    ...mapRefs(resources.diagrams, 'diagram', '/knowledge/diagrams'),
    ...mapRefs(resources.flows, 'flow', '/knowledge/flows'),
  ];
}

export function InterviewRelatedResources({
  resources,
}: InterviewRelatedResourcesProps): ReactNode {
  const { t } = useTranslations();

  const typeLabels: Readonly<Record<ResourceKind, string>> = useMemo(
    () => ({
      document: t('knowledge.interview.resourceKind.document'),
      diagram: t('knowledge.interview.resourceKind.diagram'),
      flow: t('knowledge.interview.resourceKind.flow'),
    }),
    [t],
  );

  const items: readonly FlatResourceItem[] = useMemo(
    () => flattenResources(resources, typeLabels),
    [resources, typeLabels],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-5 border-t border-zinc-200 pt-10 dark:border-zinc-800">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {t('knowledge.interview.relatedResources')}
          </h2>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            {t('knowledge.interview.relatedResourcesHint')}
          </p>
        </div>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {items.length} {t('knowledge.interview.resourceCountLabel')}
        </span>
      </header>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item: FlatResourceItem) => (
          <ResourceCard key={`${item.kind}-${item.slug}`} item={item} />
        ))}
      </ul>
    </section>
  );
}
