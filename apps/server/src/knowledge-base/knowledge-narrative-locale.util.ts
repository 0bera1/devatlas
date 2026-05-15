export type KnowledgeContentLocale = 'tr' | 'en';

export function parseKnowledgeAcceptLanguage(
  acceptLanguageHeader: string | undefined,
): KnowledgeContentLocale {
  if (
    acceptLanguageHeader === undefined ||
    acceptLanguageHeader.trim().length === 0
  ) {
    return 'tr';
  }
  const first: string =
    acceptLanguageHeader.split(',')[0]?.trim().toLowerCase() ?? '';
  if (first.startsWith('tr')) {
    return 'tr';
  }
  return 'en';
}

export function pickKnowledgeNarrative(
  narrativeTr: string | null,
  narrativeEn: string | null,
  locale: KnowledgeContentLocale,
): string | null {
  switch (locale) {
    case 'tr': {
      if (narrativeTr !== null && narrativeTr.length > 0) {
        return narrativeTr;
      }
      if (narrativeEn !== null && narrativeEn.length > 0) {
        return narrativeEn;
      }
      return null;
    }
    case 'en': {
      if (narrativeEn !== null && narrativeEn.length > 0) {
        return narrativeEn;
      }
      if (narrativeTr !== null && narrativeTr.length > 0) {
        return narrativeTr;
      }
      return null;
    }
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}
