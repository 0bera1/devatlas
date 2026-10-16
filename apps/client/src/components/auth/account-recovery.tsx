'use client';

import { accountApi } from '@/api/auth/accountApi';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';

const buttonClass =
  'w-full rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)] disabled:opacity-60';

function Notice(props: { tone: 'ok' | 'error'; text: string }): ReactNode {
  const toneClass = props.tone === 'ok' ? 'border-emerald-500/40 text-emerald-700' : 'border-red-500/40 text-red-700';
  return (
    <div role={props.tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${toneClass}`}>
      {props.text}
    </div>
  );
}

export function ForgotPasswordForm(): ReactNode {
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    try {
      await accountApi.forgotPassword(email.trim());
    } finally {
      // Yanıt hesap varlığını ifşa etmediği için hata da olsa aynı mesaj gösterilir.
      setSent(true);
      setBusy(false);
    }
  };

  return (
    <AuthShell mode="login">
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">{t('auth.forgot.title')}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{t('auth.forgot.description')}</p>
        </div>
        {sent ? (
          <Notice tone="ok" text={t('auth.forgot.sent')} />
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <AuthTextField
              id="email"
              label="E-posta"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              disabled={busy}
              required
            />
            <button type="submit" disabled={busy} className={buttonClass}>
              {t('auth.forgot.submit')}
            </button>
          </form>
        )}
        <Link href="/login" className="block text-center text-sm text-[var(--muted)] underline">
          {t('auth.forgot.back')}
        </Link>
      </div>
    </AuthShell>
  );
}

export function ResetPasswordForm(): ReactNode {
  const { t } = useTranslations();
  const router = useRouter();
  const params = useSearchParams();
  const token: string = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await accountApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.replace('/login'), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell mode="login">
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">{t('auth.reset.title')}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{t('auth.reset.description')}</p>
        </div>
        {token.length === 0 ? <Notice tone="error" text={t('auth.reset.missingToken')} /> : null}
        {error !== null ? <Notice tone="error" text={error} /> : null}
        {done ? (
          <Notice tone="ok" text={t('auth.reset.done')} />
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <AuthTextField
              id="password"
              label={t('auth.reset.password')}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              disabled={busy || token.length === 0}
              required
              minLength={8}
            />
            <button type="submit" disabled={busy || token.length === 0} className={buttonClass}>
              {t('auth.reset.submit')}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}

export function VerifyEmailView(): ReactNode {
  const { t } = useTranslations();
  const params = useSearchParams();
  const token: string = params.get('token') ?? '';
  const [status, setStatus] = useState<'pending' | 'ok' | 'error'>('pending');
  const [email, setEmail] = useState('');
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (token.length === 0) {
      setStatus('error');
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        await accountApi.verifyEmail(token);
        if (!cancelled) {
          setStatus('ok');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async (): Promise<void> => {
    if (email.trim().length === 0) {
      return;
    }
    await accountApi.resendVerification(email.trim());
    setResent(true);
  };

  return (
    <AuthShell mode="login">
      <div className="space-y-5">
        <h2 className="text-2xl font-semibold">{t('auth.verify.title')}</h2>
        {status === 'pending' ? <p className="text-sm text-[var(--muted)]">{t('auth.verify.pending')}</p> : null}
        {status === 'ok' ? <Notice tone="ok" text={t('auth.verify.success')} /> : null}
        {status === 'error' ? (
          <div className="space-y-4">
            <Notice tone="error" text={t('auth.verify.error')} />
            {resent ? (
              <Notice tone="ok" text={t('auth.verify.resent')} />
            ) : (
              <div className="space-y-3">
                <AuthTextField
                  id="email"
                  label="E-posta"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={setEmail}
                />
                <button type="button" onClick={handleResend} className={buttonClass}>
                  {t('auth.verify.resend')}
                </button>
              </div>
            )}
          </div>
        ) : null}
        {status === 'ok' ? (
          <Link href="/login" className="block text-center text-sm underline">
            {t('auth.forgot.back')}
          </Link>
        ) : null}
      </div>
    </AuthShell>
  );
}
