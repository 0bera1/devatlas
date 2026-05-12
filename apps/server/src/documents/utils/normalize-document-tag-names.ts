/**
 * İstemciden gelen ham etiket listesini Tag.name için normalize eder:
 * trim, küçük harf, boşları atar, sırayı koruyarak tekil tutar.
 */
export function normalizeDocumentTagNames(
  tags: readonly string[] | undefined,
): string[] | undefined {
  if (tags === undefined || tags.length === 0) {
    return undefined;
  }

  const seen: Set<string> = new Set<string>();
  const out: string[] = [];

  for (const raw of tags) {
    const normalized: string = raw.trim().toLowerCase();
    if (normalized.length === 0) {
      continue;
    }
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    out.push(normalized);
  }

  return out.length === 0 ? undefined : out;
}
