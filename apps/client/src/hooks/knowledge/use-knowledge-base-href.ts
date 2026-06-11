'use client';

import {
  buildKnowledgeBaseHref,
  resolveKnowledgeSectionFromPath,
} from '@/lib/knowledge/knowledge-section-storage';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export function useKnowledgeBaseHref(): string {
  const pathname: string = usePathname();

  return useMemo((): string => {
    const section = resolveKnowledgeSectionFromPath(pathname);
    return buildKnowledgeBaseHref(section);
  }, [pathname]);
}
