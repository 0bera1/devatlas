"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseKnowledgeAcceptLanguage = parseKnowledgeAcceptLanguage;
exports.pickKnowledgeNarrative = pickKnowledgeNarrative;
function parseKnowledgeAcceptLanguage(acceptLanguageHeader) {
    if (acceptLanguageHeader === undefined ||
        acceptLanguageHeader.trim().length === 0) {
        return 'tr';
    }
    const first = acceptLanguageHeader.split(',')[0]?.trim().toLowerCase() ?? '';
    if (first.startsWith('tr')) {
        return 'tr';
    }
    return 'en';
}
function pickKnowledgeNarrative(narrativeTr, narrativeEn, locale) {
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
            const _exhaustive = locale;
            return _exhaustive;
        }
    }
}
//# sourceMappingURL=knowledge-narrative-locale.util.js.map