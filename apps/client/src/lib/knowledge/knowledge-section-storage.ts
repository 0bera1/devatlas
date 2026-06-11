import type { KnowledgeSection } from '@/domains/knowledge/knowledgeDomains';

export const KNOWLEDGE_SECTION_STORAGE_KEY = 'devatlas_knowledge_section';

const KNOWLEDGE_SECTIONS: readonly KnowledgeSection[] = [
  'interview',
  'documents',
  'diagrams',
  'flows',
];

export function isKnowledgeSection(
  value: string | null | undefined,
): value is KnowledgeSection {
  if (value === null || value === undefined) {
    return false;
  }
  return (KNOWLEDGE_SECTIONS as readonly string[]).includes(value);
}

export function readStoredKnowledgeSection(): KnowledgeSection {
  if (typeof window === 'undefined') {
    return 'interview';
  }
  const raw: string | null = window.sessionStorage.getItem(
    KNOWLEDGE_SECTION_STORAGE_KEY,
  );
  return isKnowledgeSection(raw) ? raw : 'interview';
}

export function writeStoredKnowledgeSection(section: KnowledgeSection): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.setItem(KNOWLEDGE_SECTION_STORAGE_KEY, section);
}

export function resolveKnowledgeSectionFromPath(
  pathname: string,
): KnowledgeSection {
  if (pathname.startsWith('/knowledge/interview')) {
    return 'interview';
  }
  if (pathname.startsWith('/knowledge/documents')) {
    return 'documents';
  }
  if (pathname.startsWith('/knowledge/diagrams')) {
    return 'diagrams';
  }
  if (pathname.startsWith('/knowledge/flows')) {
    return 'flows';
  }
  return readStoredKnowledgeSection();
}

export function buildKnowledgeBaseHref(section: KnowledgeSection): string {
  return `/knowledge?section=${section}`;
}
