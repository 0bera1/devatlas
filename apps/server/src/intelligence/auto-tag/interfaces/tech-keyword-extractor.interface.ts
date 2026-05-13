export const TECH_KEYWORD_EXTRACTOR: unique symbol = Symbol(
  'TECH_KEYWORD_EXTRACTOR',
);

export interface ITechKeywordExtractor {
  /**
   * Verilen serbest metinden bilinen teknoloji etiketlerini çıkarır.
   * Sonuç normalize edilmiş (lowercase) ve tekildir.
   */
  extractFrom(text: string): string[];
}
