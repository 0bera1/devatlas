/**
 * Yerel geliştirmede varsayılan API adresi.
 * Özel adres için: NEXT_PUBLIC_API_URL=http://localhost:3500
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500';
}
