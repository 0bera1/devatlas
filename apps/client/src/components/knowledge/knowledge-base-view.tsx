'use client';

import { KnowledgeDiagramsPanel } from '@/components/knowledge/knowledge-diagrams-panel';
import { KnowledgeFlowsPanel } from '@/components/knowledge/knowledge-flows-panel';
import { KnowledgeDocumentsPanel } from '@/components/knowledge/knowledge-documents-panel';
import { KnowledgeInterviewPanel } from '@/components/knowledge/interview/knowledge-interview-panel';
import { KnowledgeSectionSearch } from '@/components/knowledge/knowledge-section-search';
import { KnowledgeSectionTabs } from '@/components/knowledge/knowledge-section-tabs';
import type { KnowledgeSection } from '@/domains/knowledge/knowledgeDomains';
import { useKnowledgeSection } from '@/hooks/knowledge/use-knowledge-section';
import { useDebouncedValue } from '@/hooks/ui/use-debounced-value';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';
import { useState } from 'react';

function renderSection(
  section: KnowledgeSection,
  searchQuery: string,
): ReactNode {
  switch (section) {
    case 'interview':
      return <KnowledgeInterviewPanel searchQuery={searchQuery} />;
    case 'documents':
      return <KnowledgeDocumentsPanel searchQuery={searchQuery} />;
    case 'diagrams':
      return <KnowledgeDiagramsPanel searchQuery={searchQuery} />;
    case 'flows':
      return <KnowledgeFlowsPanel searchQuery={searchQuery} />;
  }
}

export function KnowledgeBaseView(): ReactNode {
  const { t } = useTranslations();
  const { section, setSection } = useKnowledgeSection();
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearch: string = useDebouncedValue(searchInput, 300);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-6">
        <div>
          <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            {t('knowledge.title')}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
            {t('knowledge.intro')}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <KnowledgeSectionTabs value={section} onChange={setSection} />
          <KnowledgeSectionSearch value={searchInput} onChange={setSearchInput} />
          <p className="text-xs text-[var(--muted)]">{t('knowledge.search.hint')}</p>
        </div>
      </header>
      {renderSection(section, debouncedSearch.trim())}
    </div>
  );
}
