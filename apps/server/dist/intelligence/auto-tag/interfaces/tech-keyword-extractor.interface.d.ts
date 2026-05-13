export declare const TECH_KEYWORD_EXTRACTOR: unique symbol;
export interface ITechKeywordExtractor {
    extractFrom(text: string): string[];
}
