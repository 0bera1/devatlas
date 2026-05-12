/** Arama kartlarında gösterilecek içerik özeti uzunluğu. */
export const SEARCH_PREVIEW_MAX_CHARS = 180;

export function buildSearchPreview(content: string, maxChars: number): string {
  const normalized: string = content.replace(/\s+/gu, ' ').trim();
  if (normalized.length === 0) {
    return '';
  }
  if (normalized.length <= maxChars) {
    return normalized;
  }
  return `${normalized.slice(0, maxChars)}…`;
}
