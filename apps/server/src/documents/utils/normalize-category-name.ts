/**
 * Kategori adı (Category.name) için normalize: trim + küçük harf; boş → undefined.
 */
export function normalizeCategoryName(
  raw: string | undefined,
): string | undefined {
  if (raw === undefined) {
    return undefined;
  }
  const trimmed: string = raw.trim().toLowerCase();
  return trimmed.length === 0 ? undefined : trimmed;
}
