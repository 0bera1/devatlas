'use client';

import { notificationsApi, type NotificationItem } from '@/api/notifications/notificationsApi';
import { useAuth } from '@/components/providers/auth-provider';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

const POLL_MS = 60_000;

/** Bildirim zili. Okunmamış sayıyı periyodik olarak yeniler, açılınca listeyi getirir. */
export function NotificationsMenu(): ReactNode {
  const { t } = useTranslations();
  const { token } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async (): Promise<void> => {
    if (token === null) {
      return;
    }
    try {
      setCount(await notificationsApi.unreadCount(token));
    } catch {
      // Sayı alınamazsa rozet eski değerinde kalır.
    }
  }, [token]);

  useEffect(() => {
    void refreshCount();
    const timer = setInterval(() => void refreshCount(), POLL_MS);
    return () => clearInterval(timer);
  }, [refreshCount]);

  useEffect(() => {
    if (!open || token === null) {
      return;
    }
    void notificationsApi.list(token).then(setItems).catch(() => setItems([]));
  }, [open, token]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onClick = (event: MouseEvent): void => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const markAll = async (): Promise<void> => {
    if (token === null) {
      return;
    }
    await notificationsApi.markAllRead(token);
    setCount(0);
    setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
  };

  const markOne = async (item: NotificationItem): Promise<void> => {
    if (token === null || item.readAt !== null) {
      return;
    }
    await notificationsApi.markRead(token, item.id);
    setCount((value) => Math.max(0, value - 1));
    setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry)));
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t('shell.notifications')}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[var(--accent)] px-1 text-center text-[10px] font-semibold leading-[18px] text-[var(--surface)] tabular-nums">
            {count > 9 ? '9+' : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-sm font-semibold">{t('shell.notifications')}</p>
            {count > 0 ? (
              <button type="button" onClick={() => void markAll()} className="text-xs text-[var(--accent)] underline">
                {t('notifications.markAll')}
              </button>
            ) : null}
          </div>
          {items.length === 0 ? (
            <p className="px-1 py-4 text-sm text-[var(--muted)]">{t('notifications.empty')}</p>
          ) : (
            <ul className="max-h-80 divide-y divide-[var(--border)] overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.payload.diagramId !== undefined ? `/diagrams/${item.payload.diagramId}` : '/diagrams'}
                    onClick={() => void markOne(item)}
                    className={`block px-1 py-3 text-sm ${item.readAt === null ? 'font-medium' : 'text-[var(--muted)]'}`}
                  >
                    {t('notifications.invite').replace('{{title}}', item.payload.diagramTitle ?? '')}
                    <span className="mt-1 block text-xs text-[var(--muted)]">{new Date(item.createdAt).toLocaleString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
