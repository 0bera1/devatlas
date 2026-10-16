'use client';

import type { CollaborationConnection } from '@/domains/collaboration/collaborationDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export interface CollaborationLiveStripProps {
  readonly connection: CollaborationConnection;
  readonly peerCount: number;
  readonly errorDetail: string | null;
  readonly onRetry: (() => void) | undefined;
  /** Bağlı ve 0 eş: genelde kanal hazır metni */
  readonly showSoloHint: boolean;
}

export function CollaborationLiveStrip(
  props: CollaborationLiveStripProps,
): ReactNode {
  const { connection, peerCount, errorDetail, onRetry, showSoloHint } = props;
  const { t } = useTranslations();

  if (connection === 'idle') {
    return null;
  }

  const dotClasses: string = ((): string => {
    switch (connection) {
      case 'connecting':
        return 'bg-amber-500 animate-pulse';
      case 'connected':
        return 'bg-emerald-500';
      case 'disconnected':
        return 'bg-[var(--muted)]';
      case 'error':
        return 'bg-red-500';
      default: {
        const _exhaustive: never = connection;
        return _exhaustive;
      }
    }
  })();

  const message: string = ((): string => {
    switch (connection) {
      case 'connecting':
        return t('collaboration.statusConnecting');
      case 'connected': {
        if (peerCount > 0) {
          return t('collaboration.peersCount').replace(
            '{{count}}',
            String(peerCount),
          );
        }
        return showSoloHint
          ? t('collaboration.statusConnectedSolo')
          : t('collaboration.statusConnectedChannel');
      }
      case 'disconnected':
        return t('collaboration.statusDisconnected');
      case 'error':
        return t('collaboration.statusError');
      default: {
        const _exhaustive: never = connection;
        return _exhaustive;
      }
    }
  })();

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-[var(--border)]/90 bg-gradient-to-r from-violet-50/90 to-[var(--surface)] px-3 py-2.5 dark:from-violet-950/40">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${dotClasses}`}
          aria-hidden
        />
        <span className="text-xs font-medium leading-snug text-[var(--foreground)]">
          {message}
        </span>
        {(connection === 'error' || connection === 'disconnected') &&
        onRetry !== undefined ? (
          <button
            type="button"
            onClick={() => {
              onRetry();
            }}
            className="ml-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface)]"
          >
            {t('collaboration.retry')}
          </button>
        ) : null}
      </div>
      {connection === 'error' && errorDetail !== null && errorDetail.length > 0 ? (
        <p className="text-[11px] leading-relaxed text-red-700 dark:text-red-400">
          {errorDetail}
        </p>
      ) : null}
    </div>
  );
}
