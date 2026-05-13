import type { DiagramIntelligenceResource } from './diagram-intelligence-resource.interface';
import type { GeneratedDiagramTemplate } from './generated-diagram-template.interface';
import type { RelatedInterviewQuestionsResource } from './related-interview-question.interface';

export const INTELLIGENCE_SERVICE: unique symbol = Symbol(
  'INTELLIGENCE_SERVICE',
);

export interface AutoTagSource {
  readonly title?: string;
  readonly content?: string;
  readonly extraKeywords?: readonly string[];
}

export interface IIntelligenceService {
  extractDiagramKeywords(diagramId: string): Promise<string[]>;
  getDiagramResources(
    diagramId: string,
    viewerUserId: string | null,
  ): Promise<DiagramIntelligenceResource>;
  /**
   * Serbest metinlerden (başlık + içerik vb.) heuristic teknoloji etiketleri çıkarır.
   * Saf fonksiyon; veritabanına dokunmaz.
   */
  extractAutoTagsFromSource(source: AutoTagSource): string[];
  /**
   * Serbest prompt'tan heuristic mimari şablon çıkarır.
   * Frontend bu şablonu yeni bir diagram + node + edge olarak kalıcılaştırır.
   */
  generateDiagramFromPrompt(prompt: string): GeneratedDiagramTemplate;
  /**
   * Doküman tag/kategori bilgisinden hareketle ilgili mülakat sorularını getirir.
   * Erişim yoksa NotFound atılır.
   */
  getRelatedInterviewQuestionsForDocument(
    documentId: string,
    viewerUserId: string | null,
  ): Promise<RelatedInterviewQuestionsResource>;
}
