/**
 * Markdown metninden kısa, düz bir özet çıkarır: başlık, vurgu, kod ve bağlantı işaretleri atılır,
 * boşluklar sadeleşir, metin kelime sınırında kesilir.
 */
export function markdownExcerpt(markdown: string, maxLength: number = 220): string {
  const plain: string = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/[*_~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }
  const cut: string = plain.slice(0, maxLength);
  const lastSpace: number = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
