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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 lg:py-14">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {t('knowledge.title')}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t('knowledge.intro')}
          </p>
        </div>
        <KnowledgeSectionTabs value={section} onChange={setSection} />
        <KnowledgeSectionSearch value={searchInput} onChange={setSearchInput} />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t('knowledge.search.hint')}
        </p>
      </header>
      {renderSection(section, debouncedSearch.trim())}
    </main>
  );
}
