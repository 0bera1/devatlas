'use client';

import { knowledgeApi } from '@/api/knowledge/knowledgeApi';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { KnowledgeDiagramRecord, KnowledgeDocumentSummary } from '@/domains/knowledge/knowledgeDomains';
import { useQuery } from '@tanstack/react-query';

export interface LandingLiveData {
  /** Bilgi tabanından, en az üç düğümü olan bir diyagramın tam kaydı. Yüklenemezse null. */
  readonly diagram: KnowledgeDiagramRecord | null;
  /** Bilgi tabanından üç doküman özeti. */
  readonly documents: readonly KnowledgeDocumentSummary[];
  readonly isLoading: boolean;
}

const MIN_NODES = 3;

/**
 * Ana sayfanın canlı demosu için bilgi tabanı verisi. Uç noktalar giriş gerektirmez; giriş yapmamış
 * ziyaretçiler de gerçek içerikleri görür.
 */
export function useLandingLiveData(): LandingLiveData {
  const { locale } = useTranslations();

  const diagramQuery = useQuery({
    queryKey: ['landing', 'live-diagram', locale],
    queryFn: async (): Promise<KnowledgeDiagramRecord | null> => {
      const list = await knowledgeApi.listDiagrams(locale, 1);
      const candidate = list.items.find((item) => item.nodeCount >= MIN_NODES) ?? list.items[0];
      if (candidate === undefined) {
        return null;
      }
      return knowledgeApi.getDiagram(candidate.slug, locale);
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const documentsQuery = useQuery({
    queryKey: ['landing', 'live-documents', locale],
    queryFn: async (): Promise<readonly KnowledgeDocumentSummary[]> => {
      const list = await knowledgeApi.listDocuments(1);
      return list.items.slice(0, 3);
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });

  return {
    diagram: diagramQuery.data?.nodes.length ? diagramQuery.data : null,
    documents: documentsQuery.data ?? [],
    isLoading: diagramQuery.isPending || documentsQuery.isPending,
  };
}
