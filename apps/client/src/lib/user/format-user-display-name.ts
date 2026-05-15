/**
 * Profil ve arama sonuçlarında görünen tam ad.
 */
export function formatUserDisplayName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}
