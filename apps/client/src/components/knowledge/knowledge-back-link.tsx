'use client';

import { useKnowledgeBaseHref } from '@/hooks/knowledge/use-knowledge-base-href';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface KnowledgeBackLinkProps {
  readonly className?: string;
}

export function KnowledgeBackLink(props: KnowledgeBackLinkProps): ReactNode {
  const { className } = props;
  const { t } = useTranslations();
  const href: string = useKnowledgeBaseHref();

  return (
    <Link
      href={href}
      className={
        className ??
        'text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
      }
    >
      {t('knowledge.backToBase')}
    </Link>
  );
}
