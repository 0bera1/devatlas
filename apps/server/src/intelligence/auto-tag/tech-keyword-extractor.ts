import { Injectable } from '@nestjs/common';
import {
  AUTO_TAG_MAX_TAG_COUNT,
  AUTO_TAG_MAX_TEXT_LENGTH,
  TECH_KEYWORDS,
} from './tech-keywords.constant';
import type { ITechKeywordExtractor } from './interfaces/tech-keyword-extractor.interface';

/**
 * Basit ve deterministik bir auto-tag motoru.
 * - Metni küçük harfe çevirir ve uzun metinleri kırpar (OOM koruması).
 * - Sabit `TECH_KEYWORDS` listesini sırayla tarar.
 * - İlk eşleşme sırasını koruyarak en fazla `AUTO_TAG_MAX_TAG_COUNT` etiket döner.
 */
@Injectable()
export class TechKeywordExtractor implements ITechKeywordExtractor {
  public extractFrom(text: string): string[] {
    const safeText: string = this.normalizeInput(text);
    if (safeText.length === 0) {
      return [];
    }

    const matched: string[] = [];
    const seen: Set<string> = new Set<string>();

    for (const keyword of TECH_KEYWORDS) {
      if (matched.length >= AUTO_TAG_MAX_TAG_COUNT) {
        break;
      }
      if (seen.has(keyword)) {
        continue;
      }
      if (!safeText.includes(keyword)) {
        continue;
      }
      matched.push(keyword);
      seen.add(keyword);
    }

    return matched;
  }

  private normalizeInput(text: string): string {
    const trimmed: string = text.trim();
    if (trimmed.length === 0) {
      return '';
    }
    const sliced: string =
      trimmed.length > AUTO_TAG_MAX_TEXT_LENGTH
        ? trimmed.slice(0, AUTO_TAG_MAX_TEXT_LENGTH)
        : trimmed;
    return sliced.toLowerCase();
  }
}
