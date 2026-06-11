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

export function pickKnowledgeLocalizedText(
  textTr: string | null | undefined,
  textEn: string | null | undefined,
  locale: KnowledgeContentLocale,
): string {
  const tr: string = textTr?.trim() ?? '';
  const en: string = textEn?.trim() ?? '';

  switch (locale) {
    case 'tr': {
      if (tr.length > 0) {
        return tr;
      }
      return en;
    }
    case 'en': {
      if (en.length > 0) {
        return en;
      }
      return tr;
    }
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}

export function pickKnowledgeNarrative(
  narrativeTr: string | null,
  narrativeEn: string | null,
  locale: KnowledgeContentLocale,
): string | null {
  const picked: string = pickKnowledgeLocalizedText(
    narrativeTr,
    narrativeEn,
    locale,
  );
  return picked.length > 0 ? picked : null;
}
