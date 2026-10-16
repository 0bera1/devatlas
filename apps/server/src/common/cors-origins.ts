const DEV_CORS_ORIGINS: readonly string[] = ['http://localhost:3000'];

/**
 * CORS izinli origin listesini ortam değişkeninden çözer.
 * - `CORS_ORIGIN` virgülle ayrılmış liste olarak okunur.
 * - Üretimde `CORS_ORIGIN` zorunludur; yoksa uygulama açılmaz.
 * - Geliştirmede tanımlı değilse yalnızca yerel web istemcisine izin verilir.
 */
export function resolveCorsOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const configured: string[] =
    env.CORS_ORIGIN?.split(',')
      .map((origin: string) => origin.trim())
      .filter((origin: string) => origin.length > 0) ?? [];

  if (configured.length === 0 && env.NODE_ENV === 'production') {
    throw new Error('CORS_ORIGIN üretim ortamında zorunludur');
  }

  return configured.length > 0 ? configured : [...DEV_CORS_ORIGINS];
}
