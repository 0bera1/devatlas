import type { ITechKeywordExtractor } from './interfaces/tech-keyword-extractor.interface';
export declare class TechKeywordExtractor implements ITechKeywordExtractor {
    extractFrom(text: string): string[];
    private normalizeInput;
}
