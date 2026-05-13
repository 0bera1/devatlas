import type { ArchitectureTemplate } from './architecture-template.interface';

export const ARCHITECTURE_TEMPLATE_MATCHER: unique symbol = Symbol(
  'ARCHITECTURE_TEMPLATE_MATCHER',
);

export interface ArchitectureTemplateMatchResult {
  readonly template: ArchitectureTemplate;
  readonly matchedKeywords: readonly string[];
  /** Eşleşme skoru. 0 ise fallback şablon dönülmüştür. */
  readonly score: number;
}

export interface IArchitectureTemplateMatcher {
  /**
   * Serbest prompt'tan en uygun mimari şablonu bulur.
   * Eşleşme yoksa fallback şablon ile birlikte score=0 döner.
   */
  match(prompt: string): ArchitectureTemplateMatchResult;
}
