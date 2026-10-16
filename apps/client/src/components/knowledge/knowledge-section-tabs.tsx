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
      className="flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--border)]"
    >
      {SECTIONS.map((section: KnowledgeSection) => {
        const selected: boolean = value === section;
        return (
          <label
            key={section}
            className={`relative -mb-px cursor-pointer border-b-2 pb-3 text-[15px] transition-colors focus-within:text-[var(--foreground)] ${
              selected
                ? 'border-[var(--foreground)] font-semibold text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <input
              type="radio"
              name="knowledge-section"
              className="peer sr-only"
              checked={selected}
              onChange={() => {
                onChange(section);
              }}
            />
            <span className="rounded peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--accent)]">
              {labelFor(section)}
            </span>
          </label>
        );
      })}
    </div>
  );
}
