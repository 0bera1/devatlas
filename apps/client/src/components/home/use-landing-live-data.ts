'use client';

import { knowledgeApi } from '@/api/knowledge/knowledgeApi';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { KnowledgeDiagramRecord } from '@/domains/knowledge/knowledgeDomains';
import { useQuery } from '@tanstack/react-query';

export type LandingExampleKind = 'document' | 'diagram' | 'flow';

export interface LandingExample {
  readonly kind: LandingExampleKind;
  readonly slug: string;
  readonly title: string;
}

export interface LandingLiveData {
  /** Bilgi tabanından, en az üç düğümü olan bir diyagramın tam kaydı. Yüklenemezse null. */
  readonly diagram: KnowledgeDiagramRecord | null;
  /** Demo altındaki örnekler: bir doküman, bir diyagram (canlı çizilen) ve bir akış; bulunanlar sırayla. */
  readonly examples: readonly LandingExample[];
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

  const documentQuery = useQuery({
    queryKey: ['landing', 'live-document', locale],
    queryFn: async (): Promise<LandingExample | null> => {
      const first = (await knowledgeApi.listDocuments(1)).items[0];
      return first === undefined ? null : { kind: 'document', slug: first.slug, title: first.title };
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const flowQuery = useQuery({
    queryKey: ['landing', 'live-flow', locale],
    queryFn: async (): Promise<LandingExample | null> => {
      const first = (await knowledgeApi.listFlows(locale, 1)).items[0];
      return first === undefined ? null : { kind: 'flow', slug: first.slug, title: first.title };
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const diagram: KnowledgeDiagramRecord | null = diagramQuery.data?.nodes.length ? diagramQuery.data : null;
  const diagramExample: LandingExample | null = diagram === null ? null : { kind: 'diagram', slug: diagram.slug, title: diagram.title };
  const examples: LandingExample[] = [documentQuery.data ?? null, diagramExample, flowQuery.data ?? null].filter(
    (item): item is LandingExample => item !== null,
  );

  return {
    diagram,
    examples,
    isLoading: diagramQuery.isPending || documentQuery.isPending || flowQuery.isPending,
  };
}
