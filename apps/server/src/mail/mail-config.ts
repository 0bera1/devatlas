export type MailConfig =
  | { readonly mode: 'smtp'; readonly host: string; readonly port: number; readonly secure: boolean; readonly user?: string; readonly password?: string; readonly from: string; readonly appUrl: string }
  | { readonly mode: 'console'; readonly from: string; readonly appUrl: string };

const DEFAULT_FROM = 'DevAtlas <no-reply@devatlas.local>';
const DEFAULT_APP_URL = 'http://localhost:3000';

/**
 * E-posta gönderim ayarlarını ortam değişkenlerinden çözer.
 * - `SMTP_HOST` tanımlıysa SMTP ile gönderilir.
 * - Tanımlı değilse e-postalar konsola yazılır (yalnızca geliştirme).
 * - Üretimde `SMTP_HOST` zorunludur; yoksa uygulama açılmaz.
 */
export function resolveMailConfig(env: NodeJS.ProcessEnv = process.env): MailConfig {
  const from: string = env.MAIL_FROM?.trim() || DEFAULT_FROM;
  const appUrl: string = (env.APP_URL?.trim() || DEFAULT_APP_URL).replace(/\/+$/, '');
  const host: string | undefined = env.SMTP_HOST?.trim();

  if (host === undefined || host.length === 0) {
    if (env.NODE_ENV === 'production') {
      throw new Error('SMTP_HOST üretim ortamında zorunludur');
    }
    return { mode: 'console', from, appUrl };
  }

  const port: number = Number.parseInt(env.SMTP_PORT ?? '587', 10);
  const secure: boolean = env.SMTP_SECURE === 'true' || port === 465;

  return {
    mode: 'smtp',
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    user: env.SMTP_USER?.trim() || undefined,
    password: env.SMTP_PASSWORD || undefined,
    from,
    appUrl,
  };
}
