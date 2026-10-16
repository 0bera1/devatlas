'use client';

import { apiClient } from '@/api/http/api-client';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/providers/toast-provider';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

interface ShareLink {
  id: string;
  expiresAt: string;
  hasPassword: boolean;
  revokedAt: string | null;
  createdAt: string;
}

interface CreatedShareLink extends ShareLink {
  url: string;
}

const EXPIRY_OPTIONS: readonly number[] = [1, 7, 30];

export function ShareLinksButton(props: { diagramId: string }): ReactNode {
  const { t } = useTranslations();
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        {t('share.title')}
      </button>
      {open ? <ShareLinksDialog diagramId={props.diagramId} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function ShareLinksDialog(props: { diagramId: string; onClose: () => void }): ReactNode {
  const { t } = useTranslations();
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [days, setDays] = useState<number>(7);
  const [password, setPassword] = useState<string>('');
  const [created, setCreated] = useState<CreatedShareLink | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const path = `/diagrams/${props.diagramId}/share-links`;

  const load = useCallback(async (): Promise<void> => {
    if (token === null) {
      return;
    }
    try {
      const response = await apiClient.get<ShareLink[]>(path, { accessToken: token });
      setLinks(response.data);
    } catch {
      showError(t('share.error'));
    }
  }, [token, path, showError, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (): Promise<void> => {
    if (token === null) {
      return;
    }
    setBusy(true);
    try {
      const body: { expiresInDays: number; password?: string } = { expiresInDays: days };
      if (password.trim().length > 0) {
        body.password = password.trim();
      }
      const response = await apiClient.post<CreatedShareLink>(path, { accessToken: token, body });
      setCreated(response.data);
      setPassword('');
      showSuccess(t('share.created'));
      await load();
    } catch {
      showError(t('share.error'));
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (id: string): Promise<void> => {
    if (token === null) {
      return;
    }
    try {
      await apiClient.delete<void>(`${path}/${id}`, { accessToken: token });
      await load();
    } catch {
      showError(t('share.error'));
    }
  };

  const handleCopy = async (url: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      showSuccess(t('share.copied'));
    } catch {
      showError(t('share.error'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('share.title')}</h2>
          <button type="button" onClick={props.onClose} className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            ×
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
          <label className="flex flex-col gap-1 text-sm">
            {t('share.expires')}
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="rounded-lg border border-zinc-300 bg-transparent px-2 py-2 dark:border-zinc-600"
            >
              {EXPIRY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {t('share.days').replace('{{count}}', String(value))}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t('share.password')}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={4}
              maxLength={64}
              autoComplete="new-password"
              className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-600"
            />
          </label>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handleCreate()}
          className="mt-4 w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {t('share.create')}
        </button>

        {created !== null ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 p-3 text-sm">
            <span className="min-w-0 flex-1 truncate font-mono text-xs">{created.url}</span>
            <button type="button" onClick={() => void handleCopy(created.url)} className="rounded-lg border px-2 py-1 text-xs">
              {t('share.copy')}
            </button>
          </div>
        ) : null}

        <ul className="mt-5 divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
          {links.length === 0 ? <li className="py-3 text-zinc-500">{t('share.none')}</li> : null}
          {links.map((link) => {
            const expired: boolean = new Date(link.expiresAt).getTime() <= Date.now();
            const status: MessageKey =
              link.revokedAt !== null ? 'share.revoked' : expired ? 'share.expired' : 'share.active';
            return (
              <li key={link.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p>{t(status)}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(link.expiresAt).toLocaleDateString()}
                    {link.hasPassword ? ` · ${t('share.passwordProtected')}` : ''}
                  </p>
                </div>
                {link.revokedAt === null && !expired ? (
                  <button type="button" onClick={() => void handleRevoke(link.id)} className="rounded-lg border px-2 py-1 text-xs text-red-600">
                    {t('share.revoke')}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
