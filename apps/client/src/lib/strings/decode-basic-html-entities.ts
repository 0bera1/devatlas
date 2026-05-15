/** Veri kaynaklı &quot; vb. kaçışları düz metne çevirir (XSS için React zaten kaçırır). */
export function decodeBasicHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}
