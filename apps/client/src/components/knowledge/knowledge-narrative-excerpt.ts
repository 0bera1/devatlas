/** Liste kartlarında kısa önizleme metni üretir. */
export function buildKnowledgeNarrativeExcerpt(
  narrative: string | null | undefined,
  maxLength: number = 140,
): string | null {
  if (narrative === null || narrative === undefined) {
    return null;
  }

  const plain: string = narrative
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/^\|.+\|$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length === 0) {
    return null;
  }

  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength).trimEnd()}…`;
}
