import type { KnowledgeContentLocale } from './knowledge-narrative-locale.util';

const BILINGUAL_SPLIT_PATTERN = /\n---\n/;

export function pickBilingualDocumentContent(
  content: string,
  locale: KnowledgeContentLocale,
): string {
  const parts: string[] = content.split(BILINGUAL_SPLIT_PATTERN);
  if (parts.length < 2) {
    return content;
  }

  const englishPart: string = parts[0] ?? '';
  const turkishPart: string = parts[1] ?? '';

  switch (locale) {
    case 'en': {
      return stripBilingualHeading(englishPart, '(EN)');
    }
    case 'tr': {
      return stripBilingualHeading(turkishPart, '(TR)');
    }
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}

function stripBilingualHeading(section: string, marker: string): string {
  const lines: string[] = section.split('\n');
  if (lines.length === 0) {
    return section.trim();
  }
  const firstLine: string = lines[0] ?? '';
  if (firstLine.startsWith('## ') && firstLine.includes(marker)) {
    return lines.slice(1).join('\n').trim();
  }
  return section.trim();
}
