import { Injectable } from '@nestjs/common';
import {
  ARCHITECTURE_TEMPLATES,
  ARCHITECTURE_TEMPLATE_FALLBACK_ID,
  ARCHITECTURE_TEMPLATE_MAX_PROMPT_LENGTH,
} from './architecture-templates.constant';
import type { ArchitectureTemplate } from './interfaces/architecture-template.interface';
import type {
  ArchitectureTemplateMatchResult,
  IArchitectureTemplateMatcher,
} from './interfaces/architecture-template-matcher.interface';

/**
 * Heuristic mimari şablon eşleştirici.
 *
 * Her şablonun `keywords` listesi prompt içinde `includes()` ile aranır.
 * En yüksek eşleşme sayısına sahip şablon seçilir. Eşitlik durumunda
 * registry sırası tie-breaker'dır (deterministik).
 */
@Injectable()
export class ArchitectureTemplateMatcher
  implements IArchitectureTemplateMatcher
{
  public match(prompt: string): ArchitectureTemplateMatchResult {
    const normalized: string = this.normalizePrompt(prompt);
    if (normalized.length === 0) {
      return this.toFallbackResult();
    }

    let bestTemplate: ArchitectureTemplate | null = null;
    let bestMatches: readonly string[] = [];

    for (const template of ARCHITECTURE_TEMPLATES) {
      const matched: string[] = this.collectMatchedKeywords(
        template.keywords,
        normalized,
      );
      if (matched.length === 0) {
        continue;
      }
      if (matched.length > bestMatches.length) {
        bestTemplate = template;
        bestMatches = matched;
      }
    }

    if (bestTemplate === null) {
      return this.toFallbackResult();
    }

    return {
      template: bestTemplate,
      matchedKeywords: bestMatches,
      score: bestMatches.length,
    };
  }

  private normalizePrompt(prompt: string): string {
    const trimmed: string = prompt.trim();
    if (trimmed.length === 0) {
      return '';
    }
    const sliced: string =
      trimmed.length > ARCHITECTURE_TEMPLATE_MAX_PROMPT_LENGTH
        ? trimmed.slice(0, ARCHITECTURE_TEMPLATE_MAX_PROMPT_LENGTH)
        : trimmed;
    return sliced.toLowerCase();
  }

  private collectMatchedKeywords(
    keywords: readonly string[],
    normalizedPrompt: string,
  ): string[] {
    const matched: string[] = [];
    for (const keyword of keywords) {
      if (normalizedPrompt.includes(keyword)) {
        matched.push(keyword);
      }
    }
    return matched;
  }

  private toFallbackResult(): ArchitectureTemplateMatchResult {
    const fallback: ArchitectureTemplate | undefined =
      ARCHITECTURE_TEMPLATES.find(
        (candidate: ArchitectureTemplate) =>
          candidate.id === ARCHITECTURE_TEMPLATE_FALLBACK_ID,
      );
    if (fallback === undefined) {
      throw new Error(
        `Fallback architecture template "${ARCHITECTURE_TEMPLATE_FALLBACK_ID}" not found`,
      );
    }
    return { template: fallback, matchedKeywords: [], score: 0 };
  }
}
