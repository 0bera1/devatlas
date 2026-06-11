'use client';

import type { KnowledgeSection } from '@/domains/knowledge/knowledgeDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

interface KnowledgeSectionTabsProps {
  readonly value: KnowledgeSection;
  readonly onChange: (section: KnowledgeSection) => void;
}

const SECTIONS: readonly KnowledgeSection[] = [
  'interview',
  'documents',
  'diagrams',
  'flows',
];

export function KnowledgeSectionTabs(props: KnowledgeSectionTabsProps): ReactNode {
  const { value, onChange } = props;
  const { t } = useTranslations();

  const labelFor = (section: KnowledgeSection): string => {
    switch (section) {
      case 'interview':
        return t('knowledge.section.interview');
      case 'documents':
        return t('knowledge.section.documents');
      case 'diagrams':
        return t('knowledge.section.diagrams');
      case 'flows':
        return t('knowledge.section.flows');
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={t('knowledge.section.label')}
      className="inline-flex flex-wrap rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-900"
    >
      {SECTIONS.map((section: KnowledgeSection) => {
        const selected: boolean = value === section;
        return (
          <label
            key={section}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selected
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100'
            }`}
          >
            <input
              type="radio"
              name="knowledge-section"
              className="sr-only"
              checked={selected}
              onChange={() => {
                onChange(section);
              }}
            />
            {labelFor(section)}
          </label>
        );
      })}
    </div>
  );
}
