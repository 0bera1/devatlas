export type KnowledgeContentLocale = 'tr' | 'en';
export declare function parseKnowledgeAcceptLanguage(acceptLanguageHeader: string | undefined): KnowledgeContentLocale;
export declare function pickKnowledgeNarrative(narrativeTr: string | null, narrativeEn: string | null, locale: KnowledgeContentLocale): string | null;
