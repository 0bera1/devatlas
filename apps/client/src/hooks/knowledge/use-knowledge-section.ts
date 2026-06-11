'use client';

import type { KnowledgeSection } from '@/domains/knowledge/knowledgeDomains';
import {
  buildKnowledgeBaseHref,
  isKnowledgeSection,
  readStoredKnowledgeSection,
  writeStoredKnowledgeSection,
} from '@/lib/knowledge/knowledge-section-storage';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export interface UseKnowledgeSectionResult {
  readonly section: KnowledgeSection;
  readonly setSection: (section: KnowledgeSection) => void;
  readonly knowledgeBaseHref: string;
}

export function useKnowledgeSection(): UseKnowledgeSectionResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [section, setSectionState] = useState<KnowledgeSection>('interview');

  useEffect(() => {
    const fromUrl: string | null = searchParams.get('section');
    if (isKnowledgeSection(fromUrl)) {
      setSectionState(fromUrl);
      writeStoredKnowledgeSection(fromUrl);
      return;
    }
    setSectionState(readStoredKnowledgeSection());
  }, [searchParams]);

  const setSection = useCallback(
    (next: KnowledgeSection): void => {
      setSectionState(next);
      writeStoredKnowledgeSection(next);
      router.replace(buildKnowledgeBaseHref(next), { scroll: false });
    },
    [router],
  );

  const knowledgeBaseHref: string = buildKnowledgeBaseHref(section);

  return { section, setSection, knowledgeBaseHref };
}
